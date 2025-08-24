/**
 * AI Service
 * Handles AI integration for defect detection, report generation, and intelligent analysis
 */

import OpenAI from 'openai';
import * as tf from '@tensorflow/tfjs-node';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { createCanvas, loadImage } from 'canvas';
import sharp from 'sharp';
import { logger } from '../utils/logger';
import { AppError, ErrorCodes } from '../types/errors';
import {
  AIAnalysisResult,
  DefectAnalysis,
  DefectType,
  DefectSeverity,
  ReportGenerationRequest,
  AIModelConfig,
  ImageAnalysisRequest,
  TextAnalysisRequest,
  AIServiceConfig,
  ModelPerformanceMetrics,
  AIProvider,
  ConfidenceThreshold
} from '../types/ai';
import { Inspection, InspectionResponse, Asset, FormTemplate } from '../types';
import { FileService } from './file.service';
import { CacheService } from './cache.service';
import { MetricsService } from './metrics.service';
import fs from 'fs/promises';
import path from 'path';

export interface AIModelRegistry {
  defectDetection: tf.LayersModel | null;
  imageClassification: tf.LayersModel | null;
  textAnalysis: tf.LayersModel | null;
  riskAssessment: tf.LayersModel | null;
}

export interface AIAnalysisCache {
  imageHash: string;
  result: DefectAnalysis;
  timestamp: Date;
  modelVersion: string;
}

export interface ReportTemplate {
  id: string;
  name: string;
  sections: string[];
  prompts: Record<string, string>;
  formatting: {
    includeImages: boolean;
    includeCharts: boolean;
    includeRecommendations: boolean;
    format: 'markdown' | 'html' | 'pdf';
  };
}

export class AIService {
  private openaiClient: OpenAI;
  private geminiClient: GoogleGenerativeAI;
  private models: AIModelRegistry;
  private config: AIServiceConfig;
  private fileService: FileService;
  private cacheService: CacheService;
  private metricsService: MetricsService;
  private reportTemplates: Map<string, ReportTemplate> = new Map();
  private modelMetrics: Map<string, ModelPerformanceMetrics> = new Map();

  constructor(
    config: AIServiceConfig,
    fileService: FileService,
    cacheService: CacheService,
    metricsService: MetricsService
  ) {
    this.config = config;
    this.fileService = fileService;
    this.cacheService = cacheService;
    this.metricsService = metricsService;
    
    // Initialize AI clients
    this.openaiClient = new OpenAI({
      apiKey: config.openai.apiKey,
      timeout: config.openai.timeout || 30000
    });

    this.geminiClient = new GoogleGenerativeAI(config.gemini.apiKey);

    // Initialize model registry
    this.models = {
      defectDetection: null,
      imageClassification: null,
      textAnalysis: null,
      riskAssessment: null
    };

    this.initializeReportTemplates();
    this.loadModels();
  }

  /**
   * Initialize and load AI models
   */
  private async loadModels(): Promise<void> {
    try {
      logger.info('Loading AI models...');

      // Load defect detection model
      if (this.config.models.defectDetection.enabled) {
        try {
          this.models.defectDetection = await tf.loadLayersModel(
            this.config.models.defectDetection.modelPath
          );
          logger.info('Defect detection model loaded successfully');
        } catch (error) {
          logger.error('Failed to load defect detection model', { error });
        }
      }

      // Load image classification model
      if (this.config.models.imageClassification.enabled) {
        try {
          this.models.imageClassification = await tf.loadLayersModel(
            this.config.models.imageClassification.modelPath
          );
          logger.info('Image classification model loaded successfully');
        } catch (error) {
          logger.error('Failed to load image classification model', { error });
        }
      }

      // Load text analysis model
      if (this.config.models.textAnalysis.enabled) {
        try {
          this.models.textAnalysis = await tf.loadLayersModel(
            this.config.models.textAnalysis.modelPath
          );
          logger.info('Text analysis model loaded successfully');
        } catch (error) {
          logger.error('Failed to load text analysis model', { error });
        }
      }

      // Load risk assessment model
      if (this.config.models.riskAssessment.enabled) {
        try {
          this.models.riskAssessment = await tf.loadLayersModel(
            this.config.models.riskAssessment.modelPath
          );
          logger.info('Risk assessment model loaded successfully');
        } catch (error) {
          logger.error('Failed to load risk assessment model', { error });
        }
      }

      logger.info('AI models initialization completed');
    } catch (error) {
      logger.error('AI models initialization failed', { error });
      throw new AppError(
        'Failed to initialize AI models',
        500,
        ErrorCodes.AI_INITIALIZATION_FAILED
      );
    }
  }

  /**
   * Analyze inspection image for defects
   */
  async analyzeInspectionImage(
    request: ImageAnalysisRequest
  ): Promise<DefectAnalysis> {
    const startTime = Date.now();
    
    try {
      logger.info('Starting image analysis', {
        imagePath: request.imagePath,
        inspectionId: request.inspectionId
      });

      // Check cache first
      const imageHash = await this.calculateImageHash(request.imagePath);
      const cachedResult = await this.getCachedAnalysis(imageHash);
      if (cachedResult && this.isCacheValid(cachedResult)) {
        logger.info('Returning cached analysis result', { imageHash });
        return cachedResult.result;
      }

      // Preprocess image
      const preprocessedImage = await this.preprocessImage(request.imagePath);
      
      // Run defect detection
      const defects = await this.detectDefects(preprocessedImage, request);
      
      // Classify defects
      const classifiedDefects = await this.classifyDefects(defects, preprocessedImage);
      
      // Assess risk levels
      const riskAssessment = await this.assessRisk(classifiedDefects, request.context);
      
      // Generate recommendations
      const recommendations = await this.generateRecommendations(
        classifiedDefects,
        riskAssessment,
        request.context
      );

      const result: DefectAnalysis = {
        id: `analysis_${Date.now()}`,
        imagePath: request.imagePath,
        imageHash,
        defects: classifiedDefects,
        overallRisk: this.calculateOverallRisk(classifiedDefects),
        confidence: this.calculateOverallConfidence(classifiedDefects),
        recommendations,
        metadata: {
          modelVersion: this.config.models.defectDetection.version,
          analysisTime: Date.now() - startTime,
          imageSize: preprocessedImage.shape,
          provider: AIProvider.TENSORFLOW,
          processingSteps: ['preprocessing', 'detection', 'classification', 'risk_assessment']
        },
        createdAt: new Date()
      };

      // Cache the result
      await this.cacheAnalysis(imageHash, result);
      
      // Record metrics
      await this.recordAnalysisMetrics('defect_detection', Date.now() - startTime, true);

      logger.info('Image analysis completed successfully', {
        imagePath: request.imagePath,
        defectCount: classifiedDefects.length,
        overallRisk: result.overallRisk,
        analysisTime: result.metadata.analysisTime
      });

      return result;
    } catch (error) {
      await this.recordAnalysisMetrics('defect_detection', Date.now() - startTime, false);
      
      logger.error('Image analysis failed', {
        imagePath: request.imagePath,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      
      throw new AppError(
        'Image analysis failed',
        500,
        ErrorCodes.AI_ANALYSIS_FAILED,
        { originalError: error }
      );
    }
  }

  /**
   * Generate comprehensive inspection report
   */
  async generateInspectionReport(
    request: ReportGenerationRequest
  ): Promise<string> {
    const startTime = Date.now();
    
    try {
      logger.info('Starting report generation', {
        inspectionId: request.inspection.id,
        templateId: request.templateId,
        format: request.format
      });

      // Get report template
      const template = this.reportTemplates.get(request.templateId);
      if (!template) {
        throw new AppError(
          'Report template not found',
          404,
          ErrorCodes.TEMPLATE_NOT_FOUND
        );
      }

      // Prepare context data
      const context = await this.prepareReportContext(request);
      
      // Generate report content
      let reportContent: string;
      
      if (request.provider === AIProvider.GEMINI) {
        reportContent = await this.generateReportWithGemini(template, context);
      } else {
        reportContent = await this.generateReportWithOpenAI(template, context);
      }

      // Post-process report
      const finalReport = await this.postProcessReport(
        reportContent,
        template,
        request
      );

      // Record metrics
      await this.recordAnalysisMetrics('report_generation', Date.now() - startTime, true);

      logger.info('Report generation completed successfully', {
        inspectionId: request.inspection.id,
        reportLength: finalReport.length,
        generationTime: Date.now() - startTime
      });

      return finalReport;
    } catch (error) {
      await this.recordAnalysisMetrics('report_generation', Date.now() - startTime, false);
      
      logger.error('Report generation failed', {
        inspectionId: request.inspection.id,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      
      throw new AppError(
        'Report generation failed',
        500,
        ErrorCodes.AI_REPORT_GENERATION_FAILED,
        { originalError: error }
      );
    }
  }

  /**
   * Analyze inspection text responses for insights
   */
  async analyzeTextResponses(
    request: TextAnalysisRequest
  ): Promise<AIAnalysisResult> {
    const startTime = Date.now();
    
    try {
      logger.info('Starting text analysis', {
        responseCount: request.responses.length,
        inspectionId: request.inspectionId
      });

      // Combine all text responses
      const combinedText = request.responses
        .map(r => `${r.question}: ${r.answer}`)
        .join('\n\n');

      // Analyze sentiment
      const sentiment = await this.analyzeSentiment(combinedText);
      
      // Extract key themes
      const themes = await this.extractThemes(combinedText);
      
      // Identify potential issues
      const issues = await this.identifyIssues(combinedText, request.context);
      
      // Generate insights
      const insights = await this.generateInsights(
        combinedText,
        sentiment,
        themes,
        issues
      );

      const result: AIAnalysisResult = {
        id: `text_analysis_${Date.now()}`,
        type: 'text_analysis',
        confidence: this.calculateTextAnalysisConfidence(sentiment, themes, issues),
        insights,
        metadata: {
          responseCount: request.responses.length,
          textLength: combinedText.length,
          analysisTime: Date.now() - startTime,
          provider: AIProvider.OPENAI,
          sentiment,
          themes,
          issues
        },
        createdAt: new Date()
      };

      // Record metrics
      await this.recordAnalysisMetrics('text_analysis', Date.now() - startTime, true);

      logger.info('Text analysis completed successfully', {
        inspectionId: request.inspectionId,
        insightCount: insights.length,
        analysisTime: result.metadata.analysisTime
      });

      return result;
    } catch (error) {
      await this.recordAnalysisMetrics('text_analysis', Date.now() - startTime, false);
      
      logger.error('Text analysis failed', {
        inspectionId: request.inspectionId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      
      throw new AppError(
        'Text analysis failed',
        500,
        ErrorCodes.AI_ANALYSIS_FAILED,
        { originalError: error }
      );
    }
  }

  /**
   * Assess overall inspection risk
   */
  async assessInspectionRisk(
    inspection: Inspection,
    responses: InspectionResponse[],
    defectAnalyses: DefectAnalysis[]
  ): Promise<{
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
    riskScore: number;
    factors: string[];
    recommendations: string[];
  }> {
    try {
      logger.info('Starting inspection risk assessment', {
        inspectionId: inspection.id,
        responseCount: responses.length,
        defectAnalysisCount: defectAnalyses.length
      });

      // Prepare risk assessment data
      const riskData = {
        inspection,
        responses,
        defectAnalyses,
        historicalData: await this.getHistoricalRiskData(inspection.assetId)
      };

      // Use ML model if available, otherwise use rule-based assessment
      let riskAssessment;
      if (this.models.riskAssessment) {
        riskAssessment = await this.assessRiskWithModel(riskData);
      } else {
        riskAssessment = await this.assessRiskWithRules(riskData);
      }

      logger.info('Inspection risk assessment completed', {
        inspectionId: inspection.id,
        riskLevel: riskAssessment.riskLevel,
        riskScore: riskAssessment.riskScore
      });

      return riskAssessment;
    } catch (error) {
      logger.error('Inspection risk assessment failed', {
        inspectionId: inspection.id,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      
      throw new AppError(
        'Risk assessment failed',
        500,
        ErrorCodes.AI_RISK_ASSESSMENT_FAILED,
        { originalError: error }
      );
    }
  }

  /**
   * Get AI service health and performance metrics
   */
  async getServiceHealth(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    models: Record<string, { loaded: boolean; version: string; lastUsed?: Date }>;
    providers: Record<AIProvider, { available: boolean; latency?: number }>;
    metrics: ModelPerformanceMetrics[];
  }> {
    try {
      // Check model status
      const modelStatus = {
        defectDetection: {
          loaded: this.models.defectDetection !== null,
          version: this.config.models.defectDetection.version,
          lastUsed: this.modelMetrics.get('defect_detection')?.lastUsed
        },
        imageClassification: {
          loaded: this.models.imageClassification !== null,
          version: this.config.models.imageClassification.version,
          lastUsed: this.modelMetrics.get('image_classification')?.lastUsed
        },
        textAnalysis: {
          loaded: this.models.textAnalysis !== null,
          version: this.config.models.textAnalysis.version,
          lastUsed: this.modelMetrics.get('text_analysis')?.lastUsed
        },
        riskAssessment: {
          loaded: this.models.riskAssessment !== null,
          version: this.config.models.riskAssessment.version,
          lastUsed: this.modelMetrics.get('risk_assessment')?.lastUsed
        }
      };

      // Check provider availability
      const providerStatus = {
        [AIProvider.OPENAI]: await this.checkOpenAIHealth(),
        [AIProvider.GEMINI]: await this.checkGeminiHealth(),
        [AIProvider.TENSORFLOW]: await this.checkTensorFlowHealth()
      };

      // Determine overall health
      const loadedModels = Object.values(modelStatus).filter(m => m.loaded).length;
      const availableProviders = Object.values(providerStatus).filter(p => p.available).length;
      
      let status: 'healthy' | 'degraded' | 'unhealthy';
      if (loadedModels >= 2 && availableProviders >= 2) {
        status = 'healthy';
      } else if (loadedModels >= 1 && availableProviders >= 1) {
        status = 'degraded';
      } else {
        status = 'unhealthy';
      }

      return {
        status,
        models: modelStatus,
        providers: providerStatus,
        metrics: Array.from(this.modelMetrics.values())
      };
    } catch (error) {
      logger.error('AI service health check failed', { error });
      return {
        status: 'unhealthy',
        models: {},
        providers: {
          [AIProvider.OPENAI]: { available: false },
          [AIProvider.GEMINI]: { available: false },
          [AIProvider.TENSORFLOW]: { available: false }
        },
        metrics: []
      };
    }
  }

  /**
   * Private helper methods
   */
  private async preprocessImage(imagePath: string): Promise<tf.Tensor> {
    try {
      // Read and process image with Sharp
      const imageBuffer = await sharp(imagePath)
        .resize(224, 224) // Standard input size for most models
        .removeAlpha()
        .normalize()
        .toBuffer();

      // Convert to tensor
      const tensor = tf.node.decodeImage(imageBuffer, 3)
        .expandDims(0)
        .div(255.0); // Normalize to [0, 1]

      return tensor;
    } catch (error) {
      logger.error('Image preprocessing failed', { imagePath, error });
      throw new AppError(
        'Image preprocessing failed',
        500,
        ErrorCodes.IMAGE_PROCESSING_FAILED
      );
    }
  }

  private async detectDefects(
    image: tf.Tensor,
    request: ImageAnalysisRequest
  ): Promise<Array<{
    bbox: [number, number, number, number];
    confidence: number;
    type: string;
  }>> {
    if (!this.models.defectDetection) {
      throw new AppError(
        'Defect detection model not available',
        503,
        ErrorCodes.AI_MODEL_NOT_AVAILABLE
      );
    }

    try {
      // Run inference
      const predictions = this.models.defectDetection.predict(image) as tf.Tensor;
      const predictionData = await predictions.data();
      
      // Post-process predictions to extract bounding boxes and confidence scores
      const detections = this.postProcessDetections(
        predictionData,
        this.config.models.defectDetection.confidenceThreshold
      );

      // Clean up tensors
      predictions.dispose();
      image.dispose();

      return detections;
    } catch (error) {
      logger.error('Defect detection failed', { error });
      throw new AppError(
        'Defect detection failed',
        500,
        ErrorCodes.AI_INFERENCE_FAILED
      );
    }
  }

  private async classifyDefects(
    detections: Array<{
      bbox: [number, number, number, number];
      confidence: number;
      type: string;
    }>,
    image: tf.Tensor
  ): Promise<Array<{
    id: string;
    type: DefectType;
    severity: DefectSeverity;
    confidence: number;
    bbox: [number, number, number, number];
    description: string;
    recommendations: string[];
  }>> {
    const classifiedDefects = [];

    for (let i = 0; i < detections.length; i++) {
      const detection = detections[i];
      
      // Extract region of interest
      const roi = this.extractROI(image, detection.bbox);
      
      // Classify defect type and severity
      const classification = await this.classifyDefect(roi, detection);
      
      classifiedDefects.push({
        id: `defect_${Date.now()}_${i}`,
        type: classification.type,
        severity: classification.severity,
        confidence: detection.confidence * classification.confidence,
        bbox: detection.bbox,
        description: classification.description,
        recommendations: classification.recommendations
      });

      roi.dispose();
    }

    return classifiedDefects;
  }

  private async generateReportWithOpenAI(
    template: ReportTemplate,
    context: any
  ): Promise<string> {
    try {
      const prompt = this.buildReportPrompt(template, context);
      
      const response = await this.openaiClient.chat.completions.create({
        model: this.config.openai.model || 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are an expert inspection report writer. Generate comprehensive, professional inspection reports based on the provided data.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: this.config.openai.maxTokens || 4000,
        temperature: 0.3 // Lower temperature for more consistent reports
      });

      return response.choices[0]?.message?.content || '';
    } catch (error) {
      logger.error('OpenAI report generation failed', { error });
      throw new AppError(
        'OpenAI report generation failed',
        500,
        ErrorCodes.AI_PROVIDER_ERROR
      );
    }
  }

  private async generateReportWithGemini(
    template: ReportTemplate,
    context: any
  ): Promise<string> {
    try {
      const model = this.geminiClient.getGenerativeModel({
        model: this.config.gemini.model || 'gemini-pro'
      });

      const prompt = this.buildReportPrompt(template, context);
      
      const result = await model.generateContent(prompt);
      const response = await result.response;
      
      return response.text();
    } catch (error) {
      logger.error('Gemini report generation failed', { error });
      throw new AppError(
        'Gemini report generation failed',
        500,
        ErrorCodes.AI_PROVIDER_ERROR
      );
    }
  }

  private buildReportPrompt(template: ReportTemplate, context: any): string {
    let prompt = `Generate a ${template.name} report based on the following inspection data:\n\n`;
    
    // Add inspection details
    prompt += `Inspection: ${context.inspection.name} (${context.inspection.inspectionId})\n`;
    prompt += `Asset: ${context.asset?.name || 'Unknown'} (${context.asset?.assetId || 'Unknown'})\n`;
    prompt += `Date: ${context.inspection.createdAt.toLocaleDateString()}\n`;
    prompt += `Inspector: ${context.inspector?.name || 'Unknown'}\n\n`;

    // Add responses
    if (context.responses && context.responses.length > 0) {
      prompt += 'Inspection Responses:\n';
      context.responses.forEach((response: any) => {
        prompt += `- ${response.question}: ${response.answer}\n`;
      });
      prompt += '\n';
    }

    // Add defect analyses
    if (context.defectAnalyses && context.defectAnalyses.length > 0) {
      prompt += 'Defect Analysis Results:\n';
      context.defectAnalyses.forEach((analysis: DefectAnalysis) => {
        prompt += `- Found ${analysis.defects.length} defects with overall risk: ${analysis.overallRisk}\n`;
        analysis.defects.forEach(defect => {
          prompt += `  * ${defect.type}: ${defect.severity} (${Math.round(defect.confidence * 100)}% confidence)\n`;
        });
      });
      prompt += '\n';
    }

    // Add template-specific instructions
    prompt += `Please generate a comprehensive report following this structure:\n`;
    template.sections.forEach(section => {
      prompt += `- ${section}\n`;
    });

    if (template.formatting.includeRecommendations) {
      prompt += '\nInclude specific recommendations for addressing any issues found.';
    }

    return prompt;
  }

  private async prepareReportContext(request: ReportGenerationRequest): Promise<any> {
    const context: any = {
      inspection: request.inspection,
      responses: request.responses || [],
      defectAnalyses: request.defectAnalyses || []
    };

    // Add asset information if available
    if (request.inspection.assetId) {
      // This would typically fetch from AssetService
      // context.asset = await this.assetService.getById(request.inspection.assetId);
    }

    // Add inspector information
    if (request.inspection.assignedTo) {
      // This would typically fetch from UserService
      // context.inspector = await this.userService.getById(request.inspection.assignedTo);
    }

    return context;
  }

  private async calculateImageHash(imagePath: string): Promise<string> {
    try {
      const imageBuffer = await fs.readFile(imagePath);
      const crypto = await import('crypto');
      return crypto.createHash('sha256').update(imageBuffer).digest('hex');
    } catch (error) {
      logger.error('Image hash calculation failed', { imagePath, error });
      return `fallback_${Date.now()}`;
    }
  }

  private async getCachedAnalysis(imageHash: string): Promise<AIAnalysisCache | null> {
    try {
      const cached = await this.cacheService.get(`ai_analysis_${imageHash}`);
      return cached ? JSON.parse(cached) : null;
    } catch (error) {
      logger.debug('Cache retrieval failed', { imageHash, error });
      return null;
    }
  }

  private async cacheAnalysis(imageHash: string, result: DefectAnalysis): Promise<void> {
    try {
      const cacheData: AIAnalysisCache = {
        imageHash,
        result,
        timestamp: new Date(),
        modelVersion: this.config.models.defectDetection.version
      };
      
      await this.cacheService.set(
        `ai_analysis_${imageHash}`,
        JSON.stringify(cacheData),
        this.config.cache.ttl || 3600 // 1 hour default
      );
    } catch (error) {
      logger.debug('Cache storage failed', { imageHash, error });
      // Don't throw error as caching is optional
    }
  }

  private isCacheValid(cached: AIAnalysisCache): boolean {
    const maxAge = this.config.cache.ttl || 3600; // 1 hour default
    const age = (Date.now() - cached.timestamp.getTime()) / 1000;
    
    return age < maxAge && 
           cached.modelVersion === this.config.models.defectDetection.version;
  }

  private async recordAnalysisMetrics(
    operation: string,
    duration: number,
    success: boolean
  ): Promise<void> {
    try {
      const metrics = this.modelMetrics.get(operation) || {
        operation,
        totalRequests: 0,
        successfulRequests: 0,
        failedRequests: 0,
        averageLatency: 0,
        lastUsed: new Date(),
        errorRate: 0
      };

      metrics.totalRequests++;
      if (success) {
        metrics.successfulRequests++;
      } else {
        metrics.failedRequests++;
      }
      
      metrics.averageLatency = (
        (metrics.averageLatency * (metrics.totalRequests - 1)) + duration
      ) / metrics.totalRequests;
      
      metrics.errorRate = metrics.failedRequests / metrics.totalRequests;
      metrics.lastUsed = new Date();

      this.modelMetrics.set(operation, metrics);

      // Also record in metrics service
      await this.metricsService.recordAIMetrics(operation, duration, success);
    } catch (error) {
      logger.debug('Metrics recording failed', { operation, error });
      // Don't throw error as metrics are optional
    }
  }

  private initializeReportTemplates(): void {
    // Standard inspection report template
    this.reportTemplates.set('standard', {
      id: 'standard',
      name: 'Standard Inspection Report',
      sections: [
        'Executive Summary',
        'Inspection Details',
        'Findings and Observations',
        'Defect Analysis',
        'Risk Assessment',
        'Recommendations',
        'Conclusion'
      ],
      prompts: {
        summary: 'Provide a concise executive summary of the inspection results',
        findings: 'Detail all findings and observations from the inspection',
        recommendations: 'Provide specific, actionable recommendations'
      },
      formatting: {
        includeImages: true,
        includeCharts: true,
        includeRecommendations: true,
        format: 'markdown'
      }
    });

    // Compliance report template
    this.reportTemplates.set('compliance', {
      id: 'compliance',
      name: 'Compliance Inspection Report',
      sections: [
        'Compliance Overview',
        'Regulatory Requirements',
        'Compliance Status',
        'Non-Compliance Issues',
        'Corrective Actions Required',
        'Timeline for Remediation'
      ],
      prompts: {
        compliance: 'Assess compliance with relevant regulations and standards',
        issues: 'Identify and categorize non-compliance issues',
        actions: 'Specify required corrective actions with timelines'
      },
      formatting: {
        includeImages: true,
        includeCharts: false,
        includeRecommendations: true,
        format: 'html'
      }
    });

    // Add more templates as needed...
  }

  private calculateOverallRisk(defects: any[]): 'low' | 'medium' | 'high' | 'critical' {
    if (defects.length === 0) return 'low';
    
    const criticalCount = defects.filter(d => d.severity === DefectSeverity.CRITICAL).length;
    const highCount = defects.filter(d => d.severity === DefectSeverity.HIGH).length;
    
    if (criticalCount > 0) return 'critical';
    if (highCount > 2) return 'high';
    if (highCount > 0 || defects.length > 5) return 'medium';
    
    return 'low';
  }

  private calculateOverallConfidence(defects: any[]): number {
    if (defects.length === 0) return 1.0;
    
    const totalConfidence = defects.reduce((sum, defect) => sum + defect.confidence, 0);
    return totalConfidence / defects.length;
  }

  // Additional helper methods would be implemented here...
  private postProcessDetections(predictionData: Float32Array, threshold: number): any[] {
    // Implementation for post-processing model predictions
    return [];
  }

  private extractROI(image: tf.Tensor, bbox: [number, number, number, number]): tf.Tensor {
    // Implementation for extracting region of interest
    return image;
  }

  private async classifyDefect(roi: tf.Tensor, detection: any): Promise<any> {
    // Implementation for defect classification
    return {
      type: DefectType.CRACK,
      severity: DefectSeverity.MEDIUM,
      confidence: 0.8,
      description: 'Detected crack',
      recommendations: ['Monitor closely', 'Schedule repair']
    };
  }

  private async analyzeSentiment(text: string): Promise<any> {
    // Implementation for sentiment analysis
    return { score: 0.5, label: 'neutral' };
  }

  private async extractThemes(text: string): Promise<string[]> {
    // Implementation for theme extraction
    return [];
  }

  private async identifyIssues(text: string, context: any): Promise<any[]> {
    // Implementation for issue identification
    return [];
  }

  private async generateInsights(text: string, sentiment: any, themes: string[], issues: any[]): Promise<string[]> {
    // Implementation for insight generation
    return [];
  }

  private calculateTextAnalysisConfidence(sentiment: any, themes: string[], issues: any[]): number {
    // Implementation for confidence calculation
    return 0.8;
  }

  private async getHistoricalRiskData(assetId?: string): Promise<any> {
    // Implementation for historical risk data retrieval
    return {};
  }

  private async assessRiskWithModel(riskData: any): Promise<any> {
    // Implementation for ML-based risk assessment
    return {
      riskLevel: 'medium',
      riskScore: 0.6,
      factors: ['Multiple defects detected'],
      recommendations: ['Schedule maintenance']
    };
  }

  private async assessRiskWithRules(riskData: any): Promise<any> {
    // Implementation for rule-based risk assessment
    return {
      riskLevel: 'medium',
      riskScore: 0.6,
      factors: ['Multiple defects detected'],
      recommendations: ['Schedule maintenance']
    };
  }

  private async generateRecommendations(defects: any[], riskAssessment: any, context: any): Promise<string[]> {
    // Implementation for recommendation generation
    return ['Schedule immediate inspection', 'Monitor closely'];
  }

  private async postProcessReport(content: string, template: ReportTemplate, request: ReportGenerationRequest): Promise<string> {
    // Implementation for report post-processing
    return content;
  }

  private async checkOpenAIHealth(): Promise<{ available: boolean; latency?: number }> {
    try {
      const start = Date.now();
      await this.openaiClient.models.list();
      return { available: true, latency: Date.now() - start };
    } catch (error) {
      return { available: false };
    }
  }

  private async checkGeminiHealth(): Promise<{ available: boolean; latency?: number }> {
    try {
      const start = Date.now();
      const model = this.geminiClient.getGenerativeModel({ model: 'gemini-pro' });
      await model.generateContent('test');
      return { available: true, latency: Date.now() - start };
    } catch (error) {
      return { available: false };
    }
  }

  private async checkTensorFlowHealth(): Promise<{ available: boolean; latency?: number }> {
    try {
      const start = Date.now();
      const tensor = tf.zeros([1, 1]);
      tensor.dispose();
      return { available: true, latency: Date.now() - start };
    } catch (error) {
      return { available: false };
    }
  }
}
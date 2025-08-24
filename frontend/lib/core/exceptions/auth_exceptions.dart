// Authentication Exceptions
class AuthException implements Exception {
  final String message;
  final String? code;
  final dynamic details;

  const AuthException(this.message, {this.code, this.details});

  @override
  String toString() => 'AuthException: $message';
}

class InvalidCredentialsException extends AuthException {
  const InvalidCredentialsException() 
      : super('Invalid email or password', code: 'invalid_credentials');
}

class UserNotFoundException extends AuthException {
  const UserNotFoundException() 
      : super('User not found', code: 'user_not_found');
}

class EmailAlreadyExistsException extends AuthException {
  const EmailAlreadyExistsException() 
      : super('Email already exists', code: 'email_exists');
}

class WeakPasswordException extends AuthException {
  const WeakPasswordException() 
      : super('Password is too weak', code: 'weak_password');
}

class InvalidEmailException extends AuthException {
  const InvalidEmailException() 
      : super('Invalid email format', code: 'invalid_email');
}

class TokenExpiredException extends AuthException {
  const TokenExpiredException() 
      : super('Authentication token has expired', code: 'token_expired');
}

class NetworkException extends AuthException {
  const NetworkException() 
      : super('Network connection failed', code: 'network_error');
}

class ServerException extends AuthException {
  const ServerException([String? message]) 
      : super(message ?? 'Server error occurred', code: 'server_error');
}

class UnauthorizedException extends AuthException {
  const UnauthorizedException() 
      : super('Unauthorized access', code: 'unauthorized');
}

class AccountDisabledException extends AuthException {
  const AccountDisabledException() 
      : super('Account has been disabled', code: 'account_disabled');
}

class TooManyRequestsException extends AuthException {
  const TooManyRequestsException() 
      : super('Too many requests. Please try again later', code: 'too_many_requests');
}

class EmailNotVerifiedException extends AuthException {
  const EmailNotVerifiedException() 
      : super('Email address not verified', code: 'email_not_verified');
}
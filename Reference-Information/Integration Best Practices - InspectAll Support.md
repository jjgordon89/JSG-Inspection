Integration Best Practices

Best Practices

It is important when building an integration with InspectAll to put thought and care into the integration design and

avoid bad practices which can cause disruption to the service. Integrations which cause disruption will have their

API keys revoked automatically due to automated safeguards we have in place to protect the platform as a whole.

When in doubt, please reach out to us with any questions.  We want your integration to be successful!

Below are some common issues we've seen with integrations:

Request Rate Limit

You should limit the number of requests your API makes.  We have the following rate limits set for the API:

Warning issued at 100 requests/minute per IP address.

Requests blocked when over 200 requests/minute per IP address.

Don't perform batch operations, but if you MUST, perform them off

hours

In general large batch operations should be avoided. However we do understand that when starting an integration

perhaps a batch of data needs to be requested.  Examples of this is requesting every Account so as to keep your

accounts in another system in-sync.  After an initial sync be sure and use our "modifiedAt" properties on every

object to only request data that has changed since the last time you've requested data.

Off hours are on weekends beginning Saturday and ending Sunday evening Eastern time US.  If you must call

many requests during the week, preform the requests around 2am Eastern time US.

Reporting

Report generation is a very resource intense operation involving a media rendering server and many MB of photos

and data. Each time a report is requested it is rendered ad hoc in the background and the client is notified over web-

sockets on completion.  The async and resource intensive nature of this process was not designed to accommodate

API integration but rather simple client-server purposes. The reporting API is not public and should not be

automated. Performing batch operations to the reporting service will result in a revoked API key.

8/23/25, 6:12 AM Integration Best Practices - InspectAll Support

https://docs.inspectall.com/article/766-integration-best-practices 1/2


---

© InspectAll (http://www.inspectall.com) 2025. Powered by Help Scout (https://www.helpscout.com/docs-refer/?

co=InspectAll&utm_source=docs&utm_medium=footerlink&utm_campaign=Docs+Branding)

Last updated on August 11, 2021

Failing

When you received an unauthorized or other 4XX error your API should fail gracefully (meaning notify yourself and

stop making requests) . We've seen some API integrations continue to call hundreds of thousands of requests within

short amounts of time after their keys were revoked or when the request was mal-formed.

 Still need help? Contact Us (#)

RELATED ARTICLES

API Integration (/article/480-api-integration)

8/23/25, 6:12 AM Integration Best Practices - InspectAll Support

https://docs.inspectall.com/article/766-integration-best-practices 2/2


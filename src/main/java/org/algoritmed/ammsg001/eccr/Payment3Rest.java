package org.algoritmed.ammsg001.eccr;

import org.apache.http.HttpHost;
import org.apache.http.client.AuthCache;
import org.apache.http.client.protocol.ClientContext;
import org.apache.http.impl.auth.DigestScheme;
import org.apache.http.impl.client.BasicAuthCache;
import org.apache.http.protocol.BasicHttpContext;
import org.apache.http.protocol.HttpContext;

public class Payment3Rest {
	
	
	HttpHost host;
	/*
	 * https://www.baeldung.com/resttemplate-digest-authentication
	 * https://howtodoinjava.com/spring-restful/spring-restful-client-resttemplate-example/
	 * https://docs.spring.io/spring/docs/current/javadoc-api/org/springframework/web/client/RestTemplate.html
	 * https://howtodoinjava.com/
	 * https://www.baeldung.com/spring-rest-template-list
	 * https://www.baeldung.com/rest-template
	 * http://hc.apache.org/httpclient-3.x/authentication.html
	 * https://hc.apache.org/httpcomponents-client-ga/httpclient/apidocs/org/apache/http/impl/auth/DigestScheme.html
	 */
	private HttpContext createHttpContext() {
		// Create AuthCache instance
		AuthCache authCache = new BasicAuthCache();
		// Generate DIGEST scheme object, initialize it and add it to the local auth cache
		DigestScheme digestAuth = new DigestScheme();
		// If we already know the realm name
		digestAuth.overrideParamter("realm", "Custom Realm Name");
		authCache.put(host, digestAuth);

		// Add AuthCache to the execution context
		BasicHttpContext localcontext = new BasicHttpContext();
		localcontext.setAttribute(ClientContext.AUTH_CACHE, authCache);
		return localcontext;
	}
}

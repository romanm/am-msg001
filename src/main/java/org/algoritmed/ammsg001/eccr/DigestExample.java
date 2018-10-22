package org.algoritmed.ammsg001.eccr;

import java.io.IOException;
import java.net.MalformedURLException;
import java.net.URL;

import org.apache.http.Header;
import org.apache.http.HttpHost;
import org.apache.http.auth.AuthScope;
import org.apache.http.auth.MalformedChallengeException;
import org.apache.http.auth.UsernamePasswordCredentials;
import org.apache.http.client.AuthCache;
import org.apache.http.client.CredentialsProvider;
import org.apache.http.client.methods.CloseableHttpResponse;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.client.protocol.HttpClientContext;
import org.apache.http.impl.auth.DigestScheme;
import org.apache.http.impl.client.BasicAuthCache;
import org.apache.http.impl.client.BasicCredentialsProvider;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.impl.client.HttpClients;
import org.apache.http.util.EntityUtils;

/*
 * https://stackoverflow.com/questions/17599339/apache-http-digest-authentication-using-java
 */

public class DigestExample {

//	private final static String uri = "http://my.digest.based.auth.url.com";
	private final static String uri = "http://192.168.1.5";
	private static HttpHost target;

	public static void main(String[] args) throws IOException {

		setup();
		if (target == null) {
			System.out.println("Setup was unsuccesfull");
			return;
		}
		Header challengeHaeder = getAuthChallengeHaeder();
		if (challengeHaeder == null) {
			System.out.println("Setup was unsuccesfull");
			return;
		}
		System.err.println(challengeHaeder);

		// NOTE: challenge is reused for subsequent HTTP GET calls
//		getWithDigestAuth(challengeHaeder, "/", "/schema");
		getWithDigestAuth(challengeHaeder, "/cgi/state");

	}

	private static void setup() throws MalformedURLException {
		URL url = new URL(uri);
		target = new HttpHost(url.getHost(), url.getPort(), url.getProtocol());
	}

	private static Header getAuthChallengeHaeder() {
		try (CloseableHttpClient httpClient = HttpClients.createDefault()) {
			CloseableHttpResponse response = httpClient.execute(new HttpGet(uri));
			return response.getFirstHeader("WWW-Authenticate");
		} catch (IOException e) {
			e.printStackTrace();
			return null;
		}
	}

	private static void getWithDigestAuth(Header challengeHeader, String... requests)
			throws IOException {

		CredentialsProvider credsProvider = new BasicCredentialsProvider();
		credsProvider.setCredentials(
				new AuthScope(target.getHostName(), target.getPort()),
				new UsernamePasswordCredentials("1", "0"));
//		new UsernamePasswordCredentials("user", "pass"));

		try (CloseableHttpClient httpclient = HttpClients.custom()
				.setDefaultCredentialsProvider(credsProvider)
				.build()) {

			// Create AuthCache instance
			AuthCache authCache = new BasicAuthCache();
			// Generate DIGEST scheme object, initialize it and add it to the local
			// auth cache
			DigestScheme digestAuth = new DigestScheme();
			digestAuth.processChallenge(challengeHeader);
			authCache.put(target, digestAuth);

			// Add AuthCache to the execution context
			HttpClientContext localContext = HttpClientContext.create();
			localContext.setAuthCache(authCache);

			for (String request : requests) {
				System.out.println("Executing request to target " + target + request);
				try (CloseableHttpResponse response = httpclient
						.execute(target, new HttpGet(request), localContext)) {
					System.out.println("----------------------------------------");
					System.out.println(response.getStatusLine());
					System.out.println(EntityUtils.toString(response.getEntity()));
				} catch (Exception e) {
					System.out.println("Error while executing HTTP GET request");
					e.printStackTrace();
				}
			}
		} catch (MalformedChallengeException e) {
			e.printStackTrace();
		}
	}
}

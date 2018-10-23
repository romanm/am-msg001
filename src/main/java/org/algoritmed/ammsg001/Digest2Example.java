package org.algoritmed.ammsg001;

import java.io.IOException;
import java.net.URL;

import org.apache.http.Header;
import org.apache.http.HttpHost;
import org.apache.http.auth.AuthScope;
import org.apache.http.auth.MalformedChallengeException;
import org.apache.http.auth.UsernamePasswordCredentials;
import org.apache.http.client.AuthCache;
import org.apache.http.client.ClientProtocolException;
import org.apache.http.client.CredentialsProvider;
import org.apache.http.client.methods.CloseableHttpResponse;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.client.protocol.HttpClientContext;
import org.apache.http.impl.auth.DigestScheme;
import org.apache.http.impl.client.BasicAuthCache;
import org.apache.http.impl.client.BasicCredentialsProvider;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.impl.client.HttpClients;

public class Digest2Example {
	private HttpHost target;
	HttpClientContext localContextWithDigestAuth
		= HttpClientContext.create();
	CloseableHttpClient httpclient;
	public Digest2Example(String uri) throws ClientProtocolException, IOException {
		System.out.println("------------40-----------------" + uri);
//		System.out.println("------------41------------------" + env.getProperty("am.h2.baseDir"));
//		System.out.println("------------42------------------" + env.getProperty("am.eccr_IP"));
//		uri = env.getProperty("am.eccr_IP");
		URL url = new URL(uri);
		target = new HttpHost(url.getHost(), url.getPort(), url.getProtocol());
		Header challengeHeader = getAuthChallengeHeader(uri);
		System.err.println(challengeHeader);
		System.out.println("------------9------------------");
		initLocalContextWithDigestAuth(challengeHeader);
	}
	public void printXReport() throws ClientProtocolException, IOException {
		String requestState = "/cgi/state";
		CloseableHttpResponse httpGet = httpGet(requestState);
		String requestXReport = "/cgi/proc/printreport?10";
		httpPost(requestXReport);
	}
	public static void main(String[] args) throws IOException {
		Digest2Example digest2Example = new Digest2Example("http://192.168.1.5");
		digest2Example.printXReport();
	}
	private CloseableHttpResponse httpPost(String request) throws ClientProtocolException, IOException {
		return httpclient.execute(target, new HttpPost(request), localContextWithDigestAuth);
	}
	private CloseableHttpResponse httpGet(String request) throws ClientProtocolException, IOException {
		return httpclient.execute(target, new HttpGet(request), localContextWithDigestAuth);
	}

	private void initLocalContextWithDigestAuth(Header challengeHeader) {
		CredentialsProvider credsProvider = new BasicCredentialsProvider();
		credsProvider.setCredentials(
				new AuthScope(target.getHostName(), target.getPort()),
				new UsernamePasswordCredentials("1", "0"));
		httpclient = HttpClients.custom()
		.setDefaultCredentialsProvider(credsProvider)
		.build();
		AuthCache authCache = new BasicAuthCache();
		DigestScheme digestAuth = new DigestScheme();
		try {
			digestAuth.processChallenge(challengeHeader);
			authCache.put(target, digestAuth);
			localContextWithDigestAuth.setAuthCache(authCache);
		} catch (MalformedChallengeException e) {
			e.printStackTrace();
		}
	}

	private Header getAuthChallengeHeader(String uri) {
		try (CloseableHttpClient httpClient = HttpClients.createDefault()) {
			CloseableHttpResponse response = httpClient.execute(new HttpGet(uri));
			return response.getFirstHeader("WWW-Authenticate");
		} catch (IOException e) {
			e.printStackTrace();
			return null;
		}
	}

}

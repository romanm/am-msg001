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
	private String uri = "http://192.168.1.5";
	private HttpHost target;
	HttpClientContext localContextWithDigestAuth
		= HttpClientContext.create();
	CloseableHttpClient httpclient;
	public Digest2Example() throws ClientProtocolException, IOException {
		System.out.println("------------8------------------");
		URL url = new URL(uri);
		target = new HttpHost(url.getHost(), url.getPort(), url.getProtocol());
		Header challengeHeader = getAuthChallengeHeader();
		System.err.println(challengeHeader);
		System.out.println("------------9------------------");
		initLocalContextWithDigestAuth(challengeHeader);
		String requestState = "/cgi/state";
		CloseableHttpResponse httpGet = httpGet(requestState);
		String requestXReport = "/cgi/proc/printreport?10";
		httpPost(requestXReport);
	}
	public static void main(String[] args) throws IOException {
		Digest2Example digest2Example = new Digest2Example();
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

	private Header getAuthChallengeHeader() {
		try (CloseableHttpClient httpClient = HttpClients.createDefault()) {
			CloseableHttpResponse response = httpClient.execute(new HttpGet(uri));
			return response.getFirstHeader("WWW-Authenticate");
		} catch (IOException e) {
			e.printStackTrace();
			return null;
		}
	}

}

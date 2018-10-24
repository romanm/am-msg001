package org.algoritmed.ammsg001.eccr;

import java.io.IOException;
import java.io.InputStream;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.util.Map;
import static net.gcardone.junidecode.Junidecode.*;

import org.apache.commons.io.IOUtils;
import org.apache.http.Header;
import org.apache.http.HttpEntity;
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
import org.apache.http.entity.StringEntity;
import org.apache.http.impl.auth.DigestScheme;
import org.apache.http.impl.client.BasicAuthCache;
import org.apache.http.impl.client.BasicCredentialsProvider;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.impl.client.HttpClients;
import org.springframework.beans.factory.annotation.Autowired;

import com.fasterxml.jackson.databind.ObjectMapper;

public class Digest2Example {
	private HttpHost target;
	HttpClientContext localContextWithDigestAuth
		= HttpClientContext.create();
	CloseableHttpClient httpclient;
	public Digest2Example(String uri) throws ClientProtocolException, IOException {
		System.out.println("------------34-----------------" + uri);
//		uri = env.getProperty("am.eccr_IP");
		URL url = new URL(uri);
		target = new HttpHost(url.getHost(), url.getPort(), url.getProtocol());
		Header challengeHeader = getAuthChallengeHeader(uri);
		System.err.println(challengeHeader);
		System.out.println("------------40-----------------");
		initLocalContextWithDigestAuth(challengeHeader);
	}
	@Autowired	ObjectMapper objectMapper;
	public void cgiChr(Map<String, Object> paymentData) throws ClientProtocolException, IOException {
		cgiState();
		System.out.println("----42--------");
		System.out.println(paymentData);
		String requestXReport = "/cgi/chk";
		String writeValueAsString = objectMapper.writeValueAsString(paymentData);
		httpPostJSONString(requestXReport, writeValueAsString);
	}
	private void httpPostJSONString(String request, String writeValueAsString) throws ClientProtocolException, IOException {
		System.out.println(writeValueAsString);
		StringEntity entity = new StringEntity(writeValueAsString, "UTF-8");
		HttpPost httpPost = new HttpPost(request);
		httpPost.setEntity(entity);
		CloseableHttpResponse execute = httpclient.execute(target, httpPost, localContextWithDigestAuth);
		HttpEntity entity2 = execute.getEntity();
		System.out.println(entity2);
		InputStream content = entity2.getContent();
		String string = IOUtils.toString(content, StandardCharsets.UTF_8);
		System.out.println("---71-----------");
		System.out.println(string);
		System.out.println(entity2.getContentLength());
	}
	
	private CloseableHttpResponse httpPost(String request) throws ClientProtocolException, IOException {
		return httpclient.execute(target, new HttpPost(request), localContextWithDigestAuth);
	}
	public void printXReport() throws ClientProtocolException, IOException {
		cgiState();
		String requestXReport = "/cgi/proc/printreport?10";
		httpPost(requestXReport);
	}
	private void cgiState() throws ClientProtocolException, IOException {
		String requestState = "/cgi/state";
		CloseableHttpResponse httpGet = httpGet(requestState);
	}
	public static void main(String[] args) throws IOException {
		Digest2Example digest2Example = new Digest2Example("http://192.168.1.5");
		digest2Example.printXReport();
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

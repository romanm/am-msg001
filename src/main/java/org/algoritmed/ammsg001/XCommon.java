package org.algoritmed.ammsg001;

import java.io.File;
import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;

import com.fasterxml.jackson.core.JsonParseException;
import com.fasterxml.jackson.databind.JsonMappingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.gargoylesoftware.htmlunit.WebClient;

public class XCommon {
	@Autowired	ObjectMapper objectMapper;
	public Map<String, Object> readJsonFromFullFileName(String fileName) {
		File file = new File(fileName);
		return readJsonFromFullFileName(file);
	}
	public Map<String, Object> readJsonFromFullFileName(File file) {
		Map<String, Object> readJsonFileToJavaObject = null;
		try {
			readJsonFileToJavaObject = objectMapper.readValue(file, Map.class);
		} catch (JsonParseException e1) {
			e1.printStackTrace();
		} catch (JsonMappingException e1) {
			e1.printStackTrace();
		} catch (IOException e1) {
			e1.printStackTrace();
		}
		return readJsonFileToJavaObject;
	}
	protected String getString(Map<String, Object> objectA,String string) {
		return (String) objectA.get(string);
	}
	protected Map<String, Object> getMap(Map<String, Object> atcCode1, String string) {
		return (Map<String, Object>) atcCode1.get(string);
	}
	protected WebClient getWebClient(boolean cssEnabled, boolean jsEnabled) {
		WebClient client = new WebClient();
		client.getOptions().setCssEnabled(cssEnabled);  
		client.getOptions().setJavaScriptEnabled(jsEnabled);
		return client;
	}
	protected Map<String, Object> getM(int i) {
		Map<String, Object> m = new HashMap<>();
		m.put("k1", "v1");
		m.put("k2", "v2");
		m.put("i", i);
		return m;
	}
}

package org.algoritmed.ammsg001;

import java.util.HashMap;
import java.util.Map;

import com.gargoylesoftware.htmlunit.WebClient;

public class XCommon {
	protected String getString(Map<String, Object> objectA,String string) {
		return (String) objectA.get(string);
	}
	protected Map<String, Object> getMap(HashMap<String, Object> atcCode1, String string) {
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

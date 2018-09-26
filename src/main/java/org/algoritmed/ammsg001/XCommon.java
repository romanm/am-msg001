package org.algoritmed.ammsg001;

import java.util.HashMap;
import java.util.Map;

import com.gargoylesoftware.htmlunit.WebClient;

public class XCommon {
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

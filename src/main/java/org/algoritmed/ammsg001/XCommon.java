package org.algoritmed.ammsg001;

import java.util.HashMap;
import java.util.Map;

public class XCommon {
	protected Map<String, Object> getM(int i) {
		Map<String, Object> m = new HashMap<>();
		m.put("k1", "v1");
		m.put("k2", "v2");
		m.put("i", i);
		return m;
	}
}

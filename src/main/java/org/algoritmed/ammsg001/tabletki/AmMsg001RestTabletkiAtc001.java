package org.algoritmed.ammsg001.tabletki;

import java.io.IOException;
import java.net.MalformedURLException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.algoritmed.ammsg001.XCommon;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ResponseBody;

import com.gargoylesoftware.htmlunit.FailingHttpStatusCodeException;
import com.gargoylesoftware.htmlunit.WebClient;
import com.gargoylesoftware.htmlunit.html.HtmlElement;
import com.gargoylesoftware.htmlunit.html.HtmlPage;

@Controller
public class AmMsg001RestTabletkiAtc001 extends XCommon{

	WebClient client = getWebClient(false, false);

	@GetMapping("/tabletki.ua/atc")
	public @ResponseBody Map<String, Object> tabletki_ua_atc() throws FailingHttpStatusCodeException, MalformedURLException, IOException {
		Map<String, Object> m = new HashMap<>();
		
		m.put("url", "https://tabletki.ua/atc/");
		HtmlPage page = client.getPage(getString(m, "url"));
		m.put("xpathExpr", "//div[@id="
				+ "'ctl00_ctl00_MAIN_ContentPlaceHolder_MAIN_ContentPlaceHolder_ATCPanel'"
				+ "]/ul/li/a");
		List<HtmlElement> byXPath = page.getByXPath(getString(m, "xpathExpr"));
		HashMap<String, Object> atcCode1 = new HashMap<>();
		for (HtmlElement el : byXPath) {
			String href = el.getAttribute("href");
			String[] title = el.getAttribute("title").split(" - ");
			HashMap<String, Object> atcCode1v = new HashMap<>();
			atcCode1.put(title[0], atcCode1v);
			atcCode1v.put("name", title[1]);
			atcCode1v.put("href", href);
//			System.err.println(el.asXml());
		}
		m.put("atc", atcCode1);
		System.err.println(getMap(atcCode1, "A"));
		String href = getString(getMap(atcCode1, "A"), "href");
		readAtcLevel2(href);
		return m;
	}

	private void readAtcLevel2(String href) throws FailingHttpStatusCodeException, MalformedURLException, IOException {
		HtmlPage page = client.getPage(href);		
	}

}

package org.algoritmed.ammsg001.tabletki;

import java.io.IOException;
import java.net.MalformedURLException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

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
	/*
	 * https://jsoup.org/
	 * https://mvnrepository.com/artifact/org.jsoup/jsoup
	 * https://ksah.in/introduction-to-web-scraping-with-java/
	 * http://htmlunit.sourceforge.net/
	 * */
	//	String atc_tabletki_level12 = "/home/roman/algoritmed/doc-busines/mediscan-group/atc-tabletki-l2.json";
	String atc_tabletki_level12 = "/home/roman/algoritmed/doc-busines/mediscan-group/atc-tabletki-l3.json";

	@GetMapping("/tabletki.ua/atc/read_level3plus")
	public @ResponseBody Map<String, Object> tabletki_ua_atc_read_level3() throws FailingHttpStatusCodeException, MalformedURLException, IOException 
	{
		//		throws FailingHttpStatusCodeException, MalformedURLException, IOException 
		m = readJsonFromFullFileName(atc_tabletki_level12);
		Map<String, Object> actMap0 = getMap(m, "atc");
		int i = 1;
		for (String k0 : actMap0.keySet()) {
			System.err.println(k0 + " - " + i++);
			Map<String, Object> actMap1 = getMap(getMap(actMap0, k0), "atc");
			for (String k1 : actMap1.keySet()) {
				System.err.println(k1 + " -- " + i++);
				Map<String, Object> actMap2Parent = getMap(actMap1, k1);
				//				System.err.println(actMap2Parent);
				//				readAtcLevel2(getString(actMap2Parent, "href"), actMap2Parent);
				Map<String, Object> actMap2 = getMap(actMap2Parent, "atc");
				if(actMap2!=null)
					for (String k2 : actMap2.keySet()) {
						System.err.println(k2 + " -- " + i++);
						Map<String, Object> actMap3Parent = getMap(actMap2, k2);
						System.err.println(actMap3Parent);
						readAtcLevel2(getString(actMap3Parent, "href"), actMap3Parent);
					}
			}
		}
		return m;
	}

	private void readAtcLevel2(String href0, Map<String, Object> mapTarget) throws FailingHttpStatusCodeException, MalformedURLException, IOException {
		System.err.println(50);
		System.err.println(href0);
		HtmlPage page = client.getPage(href0);		
		List<HtmlElement> byXPath = page.getByXPath(getString(m, "xpathExpr"));
		HashMap<String, Object> atcCode1 = new HashMap<>();
		for (HtmlElement el : byXPath) {
			String href = el.getAttribute("href");
			String[] title = el.getAttribute("title").split(" - ");
			HashMap<String, Object> atcCode1v = new HashMap<>();
			atcCode1.put(title[0], atcCode1v);
			atcCode1v.put("name", title[1]);
			atcCode1v.put("href", httpPrefix+ href);
			//			System.err.println(el.asXml());
		}
		mapTarget.put("atc", atcCode1);
	}

	WebClient client = getWebClient(false, false);
	String atcPanelId = "'ctl00_ctl00_MAIN_ContentPlaceHolder_MAIN_ContentPlaceHolder_ATCPanel'";
	//	String atcPanelId = "'ctl00_ctl00_MAIN_ContentPlaceHolder_MAIN_ContentPlaceHolder_ATCPanel'";
	String xpathExpr = "//div[@id=" + atcPanelId + "]/ul/li/a";
	Map<String, Object> m ;
	String httpPrefix = "https:";

	@GetMapping("/tabletki.ua/atc")
	public @ResponseBody Map<String, Object> tabletki_ua_atc() throws FailingHttpStatusCodeException, MalformedURLException, IOException {
		m = new HashMap<>();

		m.put("url", httpPrefix+ "//tabletki.ua/atc/");
		HtmlPage page = client.getPage(getString(m, "url"));
		m.put("xpathExpr", xpathExpr);
		// ctl00_ctl00_MAIN_ContentPlaceHolder_MAIN_ContentPlaceHolder_ATCPanel
		// ctl00_ctl00_MAIN_ContentPlaceHolder_MAIN_ContentPlaceHolder_ATCPanel
		List<HtmlElement> byXPath = page.getByXPath(getString(m, "xpathExpr"));
		HashMap<String, Object> atcCode1 = new HashMap<>();
		for (HtmlElement el : byXPath) {
			String href = el.getAttribute("href");
			String[] title = el.getAttribute("title").split(" - ");
			HashMap<String, Object> atcCode1v = new HashMap<>();
			atcCode1.put(title[0], atcCode1v);
			atcCode1v.put("name", title[1]);
			atcCode1v.put("href", httpPrefix+ href);
			//			System.err.println(el.asXml());
			readAtcLevel2(getString(atcCode1v, "href"), atcCode1v);
		}
		m.put("atc", atcCode1);
		/*
		 * 
		Map<String, Object> mapA = getMap(atcCode1, "A");
		System.err.println(mapA);
		String href = getString(mapA, "href");
		readAtcLevel2(href, mapA);
		 */
		return m;
	}

}

package org.algoritmed.ammsg001.tabletki;

import java.util.List;
import java.util.Map;

import org.algoritmed.ammsg001.XCommon;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ResponseBody;

import com.gargoylesoftware.htmlunit.WebClient;
import com.gargoylesoftware.htmlunit.html.HtmlElement;
import com.gargoylesoftware.htmlunit.html.HtmlPage;
import com.gargoylesoftware.htmlunit.html.HtmlTable;
import com.gargoylesoftware.htmlunit.html.HtmlTableBody;

@Controller
public class AmMsg001Rest002 extends XCommon{
	@GetMapping("/test2")
	public @ResponseBody Map<String, Object> test2() {
		Map<String, Object> m = getM(123);
		WebClient client = getWebClient(false, false); 
		try {  
			String searchUrl = "https://tabletki.ua/uk/%D0%93%D0%B5%D0%BF%D0%B0%D1%80%D0%B8%D0%BD/";
			//		  String searchUrl = "https://ksah.in/introduction-to-web-scraping-with-java/";
			HtmlPage page = client.getPage(searchUrl);
			List<HtmlTable> byXPath = page.getByXPath("//table[@class='table']");
			for (HtmlTable node : byXPath) {
				List<HtmlTableBody> bodies = node.getBodies();
				HtmlTableBody htmlTableBody = bodies.get(0);
				List<HtmlElement> byXPath2 = htmlTableBody.getByXPath("tr[5]/td[2]/div");
				for (HtmlElement div : byXPath2) {
					System.err.println(div.toString());
					System.err.println(div.asXml());
				}
//				System.err.println(element.asXml());
			}
		}catch(Exception e){
			e.printStackTrace();
		}


		return m;
	}

	
}

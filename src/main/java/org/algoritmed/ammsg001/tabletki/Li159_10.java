package org.algoritmed.ammsg001.tabletki;

import java.io.IOException;
import java.io.InputStream;
import java.net.MalformedURLException;
import java.net.URL;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.Iterator;
import java.util.Map;

import org.algoritmed.ammsg001.XCommon;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.PropertySource;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ResponseBody;

import com.gargoylesoftware.htmlunit.FailingHttpStatusCodeException;
import com.gargoylesoftware.htmlunit.Page;
import com.gargoylesoftware.htmlunit.WebClient;
import com.gargoylesoftware.htmlunit.WebResponse;
import com.gargoylesoftware.htmlunit.html.HtmlButton;
import com.gargoylesoftware.htmlunit.html.HtmlForm;
import com.gargoylesoftware.htmlunit.html.HtmlPage;
import com.gargoylesoftware.htmlunit.html.HtmlPasswordInput;
import com.gargoylesoftware.htmlunit.html.HtmlTextInput;

@Controller
@PropertySource("classpath:a2.properties")
public class Li159_10  extends XCommon{
	@Autowired protected Environment env;
	SimpleDateFormat format = new SimpleDateFormat("dd.MM.yyyy kk:mm"); 
	SimpleDateFormat format2 = new SimpleDateFormat("yyyy-MM-dd kk:mm"); 
//	SimpleDateFormat format2 = new SimpleDateFormat("yyyy-MM-ddTHH:mm"); 
	@GetMapping("/li159-10")
	public @ResponseBody Map<String, Object> test2() throws FailingHttpStatusCodeException, MalformedURLException, IOException, ParseException {
		return getDayList();
	}
	private Map<String, Object> getDayList() throws MalformedURLException, IOException, ParseException {
		Map<String, Object> m = new HashMap<>();
		Map<String, Integer> cols_number = new HashMap<>();
		m.put("cols_number", cols_number);
		cols_number.put("visit_ts", 3);
		cols_number.put("patient_pip", 4);
		cols_number.put("sales", 8);
		cols_number.put("cabinet", 11);
		cols_number.put("physician", 12);
		cols_number.put("examination", 14);
		cols_number.put("referral", 20);
		cols_number.put("contrast", 21);
		cols_number.put("plan_ts", 23);
		cols_number.put("patient_phone", 43);
		cols_number.put("patient_birthdate", 5);
		ArrayList<Map<String, Object>> rows = new ArrayList<>();
		m.put("rows", rows);
		Sheet sheet = getSheet();
		Iterator<Row> rowIterator = sheet.rowIterator();
		long	min = new Date().getTime(), max = 0, current = 0;
		while (rowIterator.hasNext()) {
			Row row = rowIterator.next();
			if(row.getRowNum()>1) {
				Map<String, Object> rowMap = new HashMap<>();
				for (String col_key : cols_number.keySet()) {
					String col_value = row.getCell(cols_number.get(col_key)).getStringCellValue();
					if("visit_ts".equals(col_key)
							){
						current = putTimestamp(rowMap, col_key, col_value).getTime();
						min = Math.min(min, current);
						max = Math.max(max, current);
					}else if("plan_ts".equals(col_key)){
						putTimestamp(rowMap, col_key, col_value);
					}else {
						rowMap.put(col_key, col_value);
					}
				}
				rows.add(rowMap);
			}
		}
		m.put("min", min);
		m.put("max", max);
		m.put("from_to", format.format(new Date(max)) 
				+ " - " + format.format(new Date(min))
				+ " - " + rows.size()
				);
		return m;
	}
	private Date putTimestamp(Map<String, Object> rowMap, String col_key, String col_value) throws ParseException {
		Date ts = format.parse(col_value);
		rowMap.put(col_key, ts);
		if("visit_ts".equals(col_key)){
			String ts2 = format2.format(ts).replace(" ", "T");
			rowMap.put(col_key+"_str", ts2);
		}
		return ts;
	}
	private Sheet getSheet() throws FailingHttpStatusCodeException, MalformedURLException, IOException {
		WebResponse webResponse = getExcelResponse();
		InputStream contentAsStream = webResponse.getContentAsStream();
		XSSFWorkbook workbook = new XSSFWorkbook (contentAsStream);
		Sheet sheet = workbook.getSheetAt(0);
		return sheet;
	}
	private WebResponse getExcelResponse() throws FailingHttpStatusCodeException, MalformedURLException, IOException {
		WebClient webClient = getWebClient(false, false);
		String url = "http://192.168.0.150/auth/login";
//		String url = "http://159.224.141.10/auth/login";
		System.err.println(url);
		HtmlPage page1 = webClient.getPage(url);
		// find the login form
		HtmlForm form = page1.getForms().get(0);
		// find the inputs & button
		HtmlTextInput textField = form.getInputByName("username");
		HtmlPasswordInput pass = form.getInputByName("password");
		HtmlButton htmlButton = form.getFirstByXPath("//button");
		// fill in the input
		textField.click();
		String username = env.getProperty("li.username");
		String password = env.getProperty("li.password");
		textField.setValueAttribute(username);
		pass.click();
		pass.setValueAttribute(password);

		// push the button
		HtmlPage page2 = htmlButton.click();
		URL url2 = page2.getUrl();
		Page page = webClient.getPage(url2+"?download=on");
		WebResponse webResponse = page.getWebResponse();
		return webResponse;
	}

}

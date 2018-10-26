package org.algoritmed.ammsg001.eccr;

import java.io.IOException;
import java.security.Principal;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.function.Consumer;

import javax.servlet.http.HttpServletRequest;

import org.algoritmed.ammsg001.amdb.DbCommon;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.reactive.function.client.WebClient;

import reactor.core.publisher.Mono;

@Controller
public class Payment2Rest  extends DbCommon{
	protected static final Logger logger = LoggerFactory.getLogger(Payment2Rest.class);
	@Autowired protected Digest2Example digest2Example;

	@GetMapping("/getZReport2")
	public @ResponseBody Map<String, Object> getZReport2(
			HttpServletRequest request
			) {
		Map<String, Object> map = sqlParamToMap(request);
		logger.info("\n\n--36--- "
				+ "/getZReport2"
				+ "\n" + map
				);
		try {
			digest2Example.printXZReport(0);
		} catch (IOException e) {
			e.printStackTrace();
			String message = e.getMessage();
			map.put("error", message);
		}
		return map;
	}

	@GetMapping("/getXReport2")
	public @ResponseBody Map<String, Object> getXReport2(
			HttpServletRequest request
			) {
		Map<String, Object> map = sqlParamToMap(request);
		logger.info("\n\n--39--- "
				+ "/getXReport2"
				+ "\n" + map
				);
		try {
			digest2Example.printXZReport(10);
		} catch (IOException e) {
			e.printStackTrace();
			String message = e.getMessage();
			map.put("error", message);
		}
		return map;
	}

	public @ResponseBody Map<String, Object> getXReport2_1(
			HttpServletRequest request
		) {
		Map<String, Object> map = sqlParamToMap(request);
		logger.info("\n\n--30--- "
				+ "/url_file_write"
				+ "\n" + map
				);
		map.put("x", "y");

		WebClient webClientPaymentApparat = WebClient
				.builder()
//				.baseUrl("https://192.168.1.11")
				.build();
		System.err.println("--41---------");
		System.err.println(webClientPaymentApparat);
		try {
			Consumer<HttpHeaders> headers;
			Mono<String> result = webClientPaymentApparat.post()
					.uri( "https://192.168.1.11/cgi/proc/printreport" )
//				.headers( headers )
					.accept( MediaType.APPLICATION_JSON )
//					.body( BodyInserters.fromObject( paymentData ) )
					.exchange()
					.flatMap( clientResponse -> clientResponse.bodyToMono( String.class ) );

			System.err.println("--52---------");
			System.err.println(result);
		}catch (Exception e) {
			System.err.println("---55---------");
			System.err.println(e);
			System.err.println("---57---------");
		}
		
		return map;
	}

	@GetMapping("/cgi_chk")
	public @ResponseBody List<Map<String, Object>> cgi_chk(
			HttpServletRequest request
			) {
		List<Map<String, Object>> cgi_chk;
		try {
			cgi_chk = digest2Example.cgi_chk(0);
		} catch (IOException e) {
			e.printStackTrace();
			cgi_chk = new ArrayList<>();
			Map<String, Object> m = new HashMap<>();
			m.put("error", e.getMessage());
			cgi_chk.add(m);
		}
		return cgi_chk;
	}

	@PostMapping("/toPaymentApparatus2")
	public @ResponseBody Map<String, Object> toPaymentApparatus(
			@RequestBody Map<String, Object> paymentData
			,HttpServletRequest request
			,Principal principal
		){
		
		logger.info("\n\n--26---- "
				+ "/toPaymentApparatus2"
				+ "\n" + paymentData
				);
		Map<String, Object> cgiChr;
		try {
			System.out.println("-------101---------");
			cgiChr = digest2Example.cgiChr(paymentData);
			System.out.println("-------102---------");
		} catch (IOException e) {
			e.printStackTrace();
			cgiChr = new HashMap<>();
			cgiChr.put("error", e.getMessage());
		}
		return cgiChr;
	}

}

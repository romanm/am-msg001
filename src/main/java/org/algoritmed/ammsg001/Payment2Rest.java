package org.algoritmed.ammsg001;

import java.security.Principal;
import java.util.Map;
import java.util.function.Consumer;

import javax.servlet.http.HttpServletRequest;

import org.algoritmed.ammsg001.amdb.DbCommon;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.reactive.function.BodyInserters;
import org.springframework.web.reactive.function.client.WebClient;

import reactor.core.publisher.Mono;

@Controller
public class Payment2Rest  extends DbCommon{
	protected static final Logger logger = LoggerFactory.getLogger(Payment2Rest.class);

	@GetMapping("/getXReport2")
	public @ResponseBody Map<String, Object> getXReport(
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

	@PostMapping("/toPaymentApparatus2")
	public @ResponseBody Map<String, Object> toPaymentApparatus(
			@RequestBody Map<String, Object> paymentData
			,HttpServletRequest request
			,Principal principal
		){
		
		logger.info("\n\n--26---- "
				+ "/url_file_write"
				+ "\n" + paymentData
				);
		paymentData.put("message", "записано - може бути");

		WebClient webClientPaymentApparat = WebClient
				.builder()
//				.baseUrl("https://192.168.1.11")
				.build();
		System.err.println("--41---------");
		System.err.println(webClientPaymentApparat);
		try {
			Mono<String> result = webClientPaymentApparat.post()
					.uri( "https://192.168.1.11/url/to/send" )
//				.headers( headers )
					.accept( MediaType.APPLICATION_JSON )
					.body( BodyInserters.fromObject( paymentData ) )
					.exchange()
					.flatMap( clientResponse -> clientResponse.bodyToMono( String.class ) );

			System.err.println("--52---------");
			System.err.println(result);
		}catch (Exception e) {
			System.err.println("---55---------");
			System.err.println(e);
			System.err.println("---57---------");
		}
		return paymentData;
	}

}

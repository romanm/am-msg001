package org.algoritmed.ammsg001;

import java.util.Map;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.reactive.function.client.WebClient;

import reactor.core.publisher.Mono;

@Controller
public class AmMsg001Rest extends XCommon{
	
	@GetMapping("/test1")
	public @ResponseBody Map<String, Object> test1() {
		
		WebClient client3 = WebClient
				.builder()
				.baseUrl("https://www.baeldung.com")
				.build();
		System.err.println(client3);
//		WebClient.ResponseSpec uri = (ResponseSpec) client3.get().uri("/spring-5-webclient");
//		Mono<ClientResponse> exchange = client3.get().uri("/spring-5-webclient").exchange();
		Mono<String> bodyToMono = client3.get().uri("/spring-5-webclient").retrieve().bodyToMono(String.class);
		System.err.println(bodyToMono);
		
		Map<String, Object> m = getM(112);
		return m;
	}

}

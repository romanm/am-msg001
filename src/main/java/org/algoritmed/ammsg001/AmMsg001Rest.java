package org.algoritmed.ammsg001;

import java.security.Principal;
import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.PropertySource;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.reactive.function.client.WebClient;

import reactor.core.publisher.Mono;

@Controller
@PropertySource("classpath:a2.properties")
public class AmMsg001Rest extends XCommon{
	@Autowired protected Environment env;

	@GetMapping("/r/principal")
	public @ResponseBody Map<String, Object> principal(Principal principal) {
		Map<String, Object> map = new HashMap<>();
		map.put("m", principal);
		String amConfigFile = env.getProperty("am.configFile");
		map.put("amConfigFile", amConfigFile);
		Map<String, Object> config = readJsonFromFullFileName(amConfigFile);
		map.put("config", config);
		return map;
	}

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

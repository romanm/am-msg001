package org.algoritmed.ammsg001;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.ImportResource;

@SpringBootApplication
@ImportResource("classpath:config-app-spring.xml")
public class AmMsg001Application {

	public static void main(String[] args) {
		SpringApplication.run(AmMsg001Application.class, args);
	}
}

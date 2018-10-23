package org.algoritmed.ammsg001;


import java.io.IOException;
import java.util.Iterator;

import org.apache.http.client.ClientProtocolException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.PropertySource;
import org.springframework.core.env.AbstractEnvironment;
import org.springframework.core.env.CompositePropertySource;
import org.springframework.core.env.Environment;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.config.annotation.authentication.configurers.provisioning.InMemoryUserDetailsManagerConfigurer;
import org.springframework.security.config.annotation.authentication.configurers.provisioning.UserDetailsManagerConfigurer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter;

/**
 * Права доступу
 * @author roman
 *
 */
@Configuration
@EnableWebSecurity
@PropertySource("classpath:a2.properties")
public class WebH2AndSecurityConfig extends WebSecurityConfigurerAdapter {
	
	private @Value("${am.eccr_IP}")	 String eccr_URI;
	@Bean
	public Digest2Example digest2Example() throws ClientProtocolException, IOException {
		return new Digest2Example(eccr_URI);
	}
	private void startH2Server() {
		String startServerScript = env.getProperty("am.h2.startServerScript");
		String[] cmd = new String[]{"/bin/bash"
				, startServerScript};
		try {
			System.err.println("Attempting to start database service");
			Runtime.getRuntime().exec(cmd);
			System.err.println("Database service started");
		} catch (IOException e) {
			System.err.println("Database service start problem");
			e.printStackTrace();
		}
	}

	@Override
	protected void configure(HttpSecurity http) throws Exception {
		startH2Server();

//		CookieCsrfTokenRepository withHttpOnlyFalse = CookieCsrfTokenRepository.withHttpOnlyFalse();
		http
		.csrf()
			.disable() /* enable POST */
		.authorizeRequests()
		.antMatchers("/" /* index.html from static */
			, "/v/**" /* view HTML sites*/
			, "/f/**" /* files for sites*/
			, "/r/**" /* read JSON from server*/
			, "/webjars/**" /* CSS&JS from gradle */
		).permitAll()
		.anyRequest()
		.fullyAuthenticated()
//		.authenticated()
		.and()
		.formLogin()
		.successHandler(successHandler)
		.loginPage("/login")
		.permitAll()
		.and()
		.logout()
		.logoutSuccessHandler(successHandler)
		.permitAll();
	}
	@Autowired private SimpleAuthenticationSuccessHandler successHandler;
	@Autowired protected Environment env;
	@Autowired
	public void configureGlobal(AuthenticationManagerBuilder auth) throws Exception {
		InMemoryUserDetailsManagerConfigurer<AuthenticationManagerBuilder> inMemoryAuthentication = auth
				.inMemoryAuthentication();

		for(Iterator it = ((AbstractEnvironment) env).getPropertySources().iterator(); it.hasNext(); ) {
			Object next = it.next();
			if(next instanceof CompositePropertySource) {
				CompositePropertySource cps = (CompositePropertySource) next;
				String[] propertyNames = cps.getPropertyNames();
				for (String string : propertyNames) {
					if(string.contains("am_login")) {
						String userName = string.split("\\.")[1];
						String userPassword = env.getProperty(string);
						UserDetailsManagerConfigurer<AuthenticationManagerBuilder
						, InMemoryUserDetailsManagerConfigurer<AuthenticationManagerBuilder>>.UserDetailsBuilder 
						roles = inMemoryAuthentication.withUser(userName).password("{noop}"+userPassword).roles("USER");
						if(env.containsProperty("am_add_role_login."+userName)) {
							String add_roles = env.getProperty("am_add_role_login."+userName);
							String[] split = add_roles.split(",");
							roles.roles(split);
						}
					}
				}
			}
			
		}
		/*
		auth.jdbcAuthentication().dataSource(dataSourceDb2)
		.usersByUsernameQuery(
				"SELECT username,password, enabled FROM users WHERE username=?")
		.authoritiesByUsernameQuery(
				"SELECT username, role FROM user_roles WHERE username=?");
		 * */
	}

}

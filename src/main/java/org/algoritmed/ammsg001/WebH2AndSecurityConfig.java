package org.algoritmed.ammsg001;


import java.io.IOException;
import java.sql.SQLException;

import org.h2.tools.Server;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.PropertySource;
import org.springframework.core.env.Environment;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.config.annotation.authentication.configurers.provisioning.InMemoryUserDetailsManagerConfigurer;
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
	private void startH2Server() {
		String startServerScript = env.getProperty("am.h2.startServerScript");
		String[] cmd = new String[]{"/bin/bash"
				, startServerScript};
		try {
			System.err.println("Attempting to start database service");
			Process pr = Runtime.getRuntime().exec(cmd);
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
		String userName = env.getProperty("am.user.username");
		String userPassword = env.getProperty("am.user.password");
		String adminName = env.getProperty("am.admin.username");
		String adminPassword = env.getProperty("am.admin.password");
		InMemoryUserDetailsManagerConfigurer<AuthenticationManagerBuilder> inMemoryAuthentication = auth
				.inMemoryAuthentication();
		inMemoryAuthentication.withUser(userName).password("{noop}"+userPassword).roles("USER");
		inMemoryAuthentication.withUser(adminName).password("{noop}"+adminPassword).roles("ADMIN");
		/*

		auth.jdbcAuthentication().dataSource(dataSourceDb2)
		.usersByUsernameQuery(
				"SELECT username,password, enabled FROM users WHERE username=?")
		.authoritiesByUsernameQuery(
				"SELECT username, role FROM user_roles WHERE username=?");
		 * */
	}

}

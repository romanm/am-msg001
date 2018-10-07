package org.algoritmed.ammsg001;

import javax.sql.DataSource;

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
public class WebSecurityConfig extends WebSecurityConfigurerAdapter {

	@Override
	protected void configure(HttpSecurity http) throws Exception {
//		CookieCsrfTokenRepository withHttpOnlyFalse = CookieCsrfTokenRepository.withHttpOnlyFalse();
		System.err.println("------------25----------");
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
	@Autowired DataSource dataSourceDb2;
	@Autowired protected Environment env;
	@Autowired
	public void configureGlobal(AuthenticationManagerBuilder auth) throws Exception {
		String userName = env.getProperty("am.user.username");
		String userPassword = env.getProperty("am.user.password");
		String adminName = env.getProperty("am.admin.username");
		String adminPassword = env.getProperty("am.admin.password");
		System.err.println("------------54----------"+userName+"/"+userPassword);
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

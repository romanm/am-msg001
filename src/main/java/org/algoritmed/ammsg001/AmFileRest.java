package org.algoritmed.ammsg001;

import java.security.Principal;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.PropertySource;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.ResponseBody;

@PropertySource("classpath:a2.properties")
@Controller
public class AmFileRest extends XCommon{
	protected static final Logger logger = LoggerFactory.getLogger(AmFileRest.class);
	@Autowired protected Environment env;

	@PostMapping("/url_file_write")
	public @ResponseBody Map<String, Object> url_file_write(
			@RequestBody Map<String, Object> data
			,HttpServletRequest request
			,Principal principal
		){

		logger.info("\n\n--27---- "
				+ "/url_file_write"
				+ "\n" + data
				);

		String amConfigFile = env.getProperty("am.configFile");
		writeJsonToFile(amConfigFile, data);
		return data;
	}
}

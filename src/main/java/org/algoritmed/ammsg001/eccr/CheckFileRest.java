package org.algoritmed.ammsg001.eccr;

import java.security.Principal;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.ResponseBody;

@Controller
public class CheckFileRest {
	protected static final Logger logger = LoggerFactory.getLogger(CheckFileRest.class);

	@PostMapping("/saveCheckFile")
	public @ResponseBody Map<String, Object> saveCheckFile(
			@RequestBody Map<String, Object> data
			,HttpServletRequest request
			,Principal principal
		){
		logger.info("\n\n--26---- "
				+ "/saveCheckFile"
				+ "\n" + data
				);
		return data;
	}

}

package org.algoritmed.ammsg001.amdb;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

@Controller
public class Db1Rest  extends DbCommon{

	@GetMapping("/r/url_sql_read_db1")
	public @ResponseBody Map<String, Object> url_sql_read_db1(
			@RequestParam(value = "sql", required = true) String sql
			,HttpServletRequest request
		) {
		Map<String, Object> map = sqlParamToMap(request);
		Map m = new HashMap();
		m.put("k", "v");
		m.put("sql", sql);
		List<Map<String, Object>> list = dbParamJdbcTemplate.queryForList(sql, map);
		map.put("list", list);

		return map;
	}
	protected @Autowired @Qualifier("db1ParamJdbcTemplate")	NamedParameterJdbcTemplate dbParamJdbcTemplate;
}

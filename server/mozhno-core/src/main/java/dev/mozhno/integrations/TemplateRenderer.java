package dev.mozhno.integrations;

import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.springframework.stereotype.Component;

@Component
public class TemplateRenderer {

    private static final Pattern TEMPLATE_PATTERN = Pattern.compile("\\{\\{events\\.([a-zA-Z0-9_.]+)\\}\\}");

    public String render(String template, Map<String, String> context) {
        if (template == null || template.isEmpty()) {
            return "";
        }

        Matcher matcher = TEMPLATE_PATTERN.matcher(template);
        StringBuilder result = new StringBuilder();

        while (matcher.find()) {
            String key = matcher.group(1);
            String replacement = context.getOrDefault(key, matcher.group(0));
            matcher.appendReplacement(result, Matcher.quoteReplacement(replacement));
        }
        matcher.appendTail(result);

        return result.toString();
    }
}

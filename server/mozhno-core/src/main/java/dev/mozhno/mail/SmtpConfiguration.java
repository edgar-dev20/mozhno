package dev.mozhno.mail;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.JavaMailSenderImpl;

import java.util.Properties;

@Configuration
@ConditionalOnProperty("mozhno.smtp.host")
public class SmtpConfiguration {

    private final MozhnoSmtpProperties smtpProperties;

    public SmtpConfiguration(MozhnoSmtpProperties smtpProperties) {
        this.smtpProperties = smtpProperties;
    }

    @Bean
    public JavaMailSender javaMailSender() {
        JavaMailSenderImpl sender = new JavaMailSenderImpl();
        sender.setHost(smtpProperties.getHost());
        sender.setPort(smtpProperties.getPort());
        sender.setUsername(smtpProperties.getUsername());
        sender.setPassword(smtpProperties.getPassword());

        Properties mailProps = sender.getJavaMailProperties();
        mailProps.put("mail.smtp.auth", smtpProperties.getUsername() != null && !smtpProperties.getUsername().isEmpty());
        mailProps.put("mail.smtp.connectiontimeout", "10000");
        mailProps.put("mail.smtp.timeout", "10000");
        mailProps.put("mail.smtp.writetimeout", "10000");

        if (smtpProperties.isSsl()) {
            mailProps.put("mail.smtp.ssl.enable", "true");
        } else if (smtpProperties.isStarttls()) {
            mailProps.put("mail.smtp.starttls.enable", "true");
            mailProps.put("mail.smtp.starttls.required", "true");
        }

        return sender;
    }
}

package ru.mozhno.configurations.persistence;

import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.PropertySource;
import org.springframework.transaction.annotation.EnableTransactionManagement;

@Configuration
@ComponentScan({"com.baeldung.Jooq.introduction.db.public_.tables"})
@EnableTransactionManagement
@PropertySource("classpath:intro_config.properties")
public class PersistenceContext {


}

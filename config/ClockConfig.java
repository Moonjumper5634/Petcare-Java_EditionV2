package ph.gov.santarosa.petcare.config;

import java.time.Clock;
import java.time.LocalDate;
import java.time.ZoneId;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * The application's notion of "today". The front end pins it to 17 Aug 2026 so that seeded pets keep
 * giving the same eligibility results; the dev profile does the same via petcare.reference-date.
 * Leave the property empty in production to use the real date (Philippine time).
 */
@Configuration
public class ClockConfig {

    private static final ZoneId MANILA = ZoneId.of("Asia/Manila");

    @Bean
    public Clock clock(@Value("${petcare.reference-date:}") String referenceDate) {
        if (referenceDate == null || referenceDate.isBlank()) return Clock.system(MANILA);
        return Clock.fixed(LocalDate.parse(referenceDate.trim()).atStartOfDay(MANILA).toInstant(), MANILA);
    }
}

package com.securevote.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import com.securevote.backend.entity.Election;
import com.securevote.backend.repository.ElectionRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import java.time.Instant;
import java.time.temporal.ChronoUnit;

@SpringBootApplication
public class SecurevoteBackendApplication {

	public static void main(String[] args) {
		SpringApplication.run(SecurevoteBackendApplication.class, args);
	}

	@Bean
	CommandLineRunner init(ElectionRepository repository) {
		return args -> {
			if (repository.count() == 0) {
				Election election1 = new Election();
				election1.setTitle("2026 National Presidential Election");
				election1.setDescription("Every vote counts. Choose the leader of tomorrow.");
				election1.setStatus("active");
				election1.setIsPublished(true);
				election1.setStartTime(Instant.now());
				election1.setEndTime(Instant.now().plus(30, ChronoUnit.DAYS));
				election1.setVotingRules("Ranked Choice Voting");
				repository.save(election1);

				Election election2 = new Election();
				election2.setTitle("Local City Council - District 9");
				election2.setDescription("Vote for your local representative for better infrastructure.");
				election2.setStatus("active");
				election2.setIsPublished(true);
				election2.setStartTime(Instant.now());
				election2.setEndTime(Instant.now().plus(7, ChronoUnit.DAYS));
				election2.setVotingRules("Single Choice Voting");
				repository.save(election2);
			}
		};
	}
}

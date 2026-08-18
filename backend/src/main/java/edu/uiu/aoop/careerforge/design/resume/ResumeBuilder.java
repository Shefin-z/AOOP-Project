package edu.uiu.aoop.careerforge.design.resume;

/** Small Builder-pattern example for constructing a resume summary. */
public final class ResumeBuilder {
  private String headline = "";
  private String skills = "";
  private String education = "";

  public ResumeBuilder headline(String value) { headline = value; return this; }
  public ResumeBuilder skills(String value) { skills = value; return this; }
  public ResumeBuilder education(String value) { education = value; return this; }

  public Resume build() { return new Resume(headline, skills, education); }

  public record Resume(String headline, String skills, String education) {}
}

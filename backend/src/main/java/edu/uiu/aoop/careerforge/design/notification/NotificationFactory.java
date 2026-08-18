package edu.uiu.aoop.careerforge.design.notification;

/** Simple Factory-pattern example for creating a notification message. */
public final class NotificationFactory {

  private NotificationFactory() {}

  public static Notification create(Channel channel, String message) {
    return new Notification(channel, message);
  }

  public enum Channel { EMAIL, IN_APP }

  public record Notification(Channel channel, String message) {}
}

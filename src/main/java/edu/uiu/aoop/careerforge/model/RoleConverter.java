package edu.uiu.aoop.careerforge.model;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

import java.util.Locale;

@Converter
public class RoleConverter implements AttributeConverter<Role, String> {

    @Override
    public String convertToDatabaseColumn(Role role) {
        return role == null ? null : role.name().toLowerCase(Locale.ROOT);
    }

    @Override
    public Role convertToEntityAttribute(String value) {
        return value == null ? null : Role.valueOf(value.toUpperCase(Locale.ROOT));
    }
}

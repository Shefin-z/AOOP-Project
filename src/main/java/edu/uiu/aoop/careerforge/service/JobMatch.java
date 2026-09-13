package edu.uiu.aoop.careerforge.service;

import java.math.BigDecimal;
import java.util.List;

public record JobMatch(BigDecimal percentage, List<String> reasons) { }

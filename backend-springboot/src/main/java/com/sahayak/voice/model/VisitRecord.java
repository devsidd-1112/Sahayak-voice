package com.sahayak.voice.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * VisitRecord entity representing a home visit record for maternal and child health.
 * Stores patient information and visit details captured by ASHA workers.
 */
@Document(collection = "visits")
public class VisitRecord {
    
    @Id
    private String id;
    
    @Indexed
    private String userId;
    
    private String patientName;
    
    private String bloodPressure;
    
    private String childSymptom;
    
    private LocalDate visitDate;
    
    @Indexed
    private LocalDateTime createdAt;
    
    // Constructors
    public VisitRecord() {
        this.createdAt = LocalDateTime.now();
    }
    
    public VisitRecord(String userId, String patientName, String bloodPressure, 
                       String childSymptom, LocalDate visitDate) {
        this.userId = userId;
        this.patientName = patientName;
        this.bloodPressure = bloodPressure;
        this.childSymptom = childSymptom;
        this.visitDate = visitDate;
        this.createdAt = LocalDateTime.now();
    }
    
    // Getters and Setters
    public String getId() {
        return id;
    }
    
    public void setId(String id) {
        this.id = id;
    }
    
    public String getUserId() {
        return userId;
    }
    
    public void setUserId(String userId) {
        this.userId = userId;
    }
    
    public String getPatientName() {
        return patientName;
    }
    
    public void setPatientName(String patientName) {
        this.patientName = patientName;
    }
    
    public String getBloodPressure() {
        return bloodPressure;
    }
    
    public void setBloodPressure(String bloodPressure) {
        this.bloodPressure = bloodPressure;
    }
    
    public String getChildSymptom() {
        return childSymptom;
    }
    
    public void setChildSymptom(String childSymptom) {
        this.childSymptom = childSymptom;
    }
    
    public LocalDate getVisitDate() {
        return visitDate;
    }
    
    public void setVisitDate(LocalDate visitDate) {
        this.visitDate = visitDate;
    }
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
    
    @Override
    public String toString() {
        return "VisitRecord{" +
                "id='" + id + '\'' +
                ", userId='" + userId + '\'' +
                ", patientName='" + patientName + '\'' +
                ", bloodPressure='" + bloodPressure + '\'' +
                ", childSymptom='" + childSymptom + '\'' +
                ", visitDate=" + visitDate +
                ", createdAt=" + createdAt +
                '}';
    }
}

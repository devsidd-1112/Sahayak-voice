package com.sahayak.voice.controller;

import com.sahayak.voice.model.VisitRecord;
import com.sahayak.voice.service.VisitService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Visit Controller
 * 
 * Handles visit record endpoints for syncing and retrieving visit data.
 * All endpoints require JWT authentication.
 */
@RestController
@RequestMapping("/api/visits")
public class VisitController {
    
    private final VisitService visitService;
    
    /**
     * Constructor with dependency injection.
     * 
     * @param visitService the visit service
     */
    public VisitController(VisitService visitService) {
        this.visitService = visitService;
    }
    
    /**
     * Sync endpoint for mobile app to upload visit records.
     * Requires JWT authentication via Authorization header.
     * 
     * POST /api/visits/sync
     * 
     * @param record the visit record to sync
     * @return ResponseEntity with the saved visit record
     */
    @PostMapping("/sync")
    public ResponseEntity<?> syncVisit(@Valid @RequestBody VisitRecord record) {
        try {
            // Get authenticated user ID from security context
            String userId = getAuthenticatedUserId();
            
            if (userId == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(createErrorResponse("Authentication required", "No valid authentication token provided"));
            }
            
            // Save the visit record
            VisitRecord savedRecord = visitService.saveVisit(record, userId);
            
            // Return 201 Created with the saved record
            return ResponseEntity.status(HttpStatus.CREATED).body(savedRecord);
            
        } catch (IllegalArgumentException e) {
            // Handle validation errors
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(createErrorResponse("Validation error", e.getMessage()));
                
        } catch (Exception e) {
            // Handle unexpected errors
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(createErrorResponse("Server error", "An error occurred while saving the visit record"));
        }
    }
    
    /**
     * Get all visit records for the authenticated user.
     * Requires JWT authentication via Authorization header.
     * 
     * GET /api/visits
     * 
     * @return ResponseEntity with list of visit records
     */
    @GetMapping
    public ResponseEntity<?> getVisits() {
        try {
            // Get authenticated user ID from security context
            String userId = getAuthenticatedUserId();
            
            if (userId == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(createErrorResponse("Authentication required", "No valid authentication token provided"));
            }
            
            // Retrieve all visits for the user
            List<VisitRecord> visits = visitService.getVisitsByUser(userId);
            
            // Return 200 OK with the list of visits
            return ResponseEntity.ok(visits);
            
        } catch (Exception e) {
            // Handle unexpected errors
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(createErrorResponse("Server error", "An error occurred while retrieving visit records"));
        }
    }
    
    /**
     * Get the authenticated user ID from the security context.
     * 
     * @return the user ID or null if not authenticated
     */
    private String getAuthenticatedUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        
        if (authentication != null && authentication.isAuthenticated() 
                && authentication.getPrincipal() instanceof String) {
            return (String) authentication.getPrincipal();
        }
        
        return null;
    }
    
    /**
     * Create a standardized error response.
     * 
     * @param error the error type
     * @param message the error message
     * @return Map containing error details
     */
    private Map<String, String> createErrorResponse(String error, String message) {
        Map<String, String> errorResponse = new HashMap<>();
        errorResponse.put("error", error);
        errorResponse.put("message", message);
        return errorResponse;
    }
}

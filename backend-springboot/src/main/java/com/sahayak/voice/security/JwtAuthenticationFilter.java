package com.sahayak.voice.security;

import com.sahayak.voice.service.AuthenticationService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.ArrayList;

/**
 * JWT Authentication Filter
 * 
 * Intercepts requests to protected endpoints and validates JWT tokens.
 * Extracts the user ID from valid tokens and sets it in the security context.
 */
@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {
    
    private final AuthenticationService authenticationService;
    
    /**
     * Constructor with dependency injection.
     * 
     * @param authenticationService the authentication service for token validation
     */
    public JwtAuthenticationFilter(AuthenticationService authenticationService) {
        this.authenticationService = authenticationService;
    }
    
    /**
     * Filter method that validates JWT tokens on each request.
     * 
     * @param request the HTTP request
     * @param response the HTTP response
     * @param filterChain the filter chain
     * @throws ServletException if a servlet error occurs
     * @throws IOException if an I/O error occurs
     */
    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest request, 
                                    @NonNull HttpServletResponse response, 
                                    @NonNull FilterChain filterChain) 
            throws ServletException, IOException {
        
        try {
            // Extract JWT token from Authorization header
            String token = extractTokenFromRequest(request);
            
            if (token != null && authenticationService.validateToken(token)) {
                // Extract user ID from token
                String userId = authenticationService.getUserIdFromToken(token);
                
                // Create authentication object and set in security context
                UsernamePasswordAuthenticationToken authentication = 
                    new UsernamePasswordAuthenticationToken(userId, null, new ArrayList<>());
                authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                
                SecurityContextHolder.getContext().setAuthentication(authentication);
            }
        } catch (Exception e) {
            // Log the error but don't block the request
            // The security configuration will handle unauthorized access
            logger.error("Cannot set user authentication: " + e.getMessage());
        }
        
        filterChain.doFilter(request, response);
    }
    
    /**
     * Extract JWT token from the Authorization header.
     * Expected format: "Bearer <token>"
     * 
     * @param request the HTTP request
     * @return the JWT token or null if not found
     */
    private String extractTokenFromRequest(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        
        if (bearerToken != null && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        
        return null;
    }
}

import React from 'react';
import { Link } from 'react-router-dom';
import { Box, Container, Grid, Typography, Link as MuiLink } from '@mui/material';

const Footer: React.FC = () => {
  return (
    <Box component="footer" sx={{ bgcolor: 'background.paper', py: 6 }}>
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          {/* Our Story */}
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="h6" color="text.primary" gutterBottom>
              Our Story
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              It started with two kids—and two parents who wanted to do better.
            </Typography>
            <MuiLink component={Link} to="/our-story" color="inherit">
              Learn More
            </MuiLink>
          </Grid>

          {/* Team */}
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="h6" color="text.primary" gutterBottom>
              Team
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              We're a team of parents, educators, and child development researchers.
            </Typography>
            <MuiLink component={Link} to="/team" color="inherit">
              Meet the Team
            </MuiLink>
          </Grid>

          {/* Support */}
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="h6" color="text.primary" gutterBottom>
              Support
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Need help? We're here for you.
            </Typography>
            <MuiLink component={Link} to="/support" color="inherit">
              Get Support
            </MuiLink>
          </Grid>

          {/* Feedback */}
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="h6" color="text.primary" gutterBottom>
              Feedback
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Help us improve Kidoova.
            </Typography>
            <MuiLink component={Link} to="/feedback" color="inherit">
              Share Feedback
            </MuiLink>
          </Grid>

          {/* Legal Links */}
          <Grid item xs={12}>
            <Box sx={{ borderTop: 1, borderColor: 'divider', pt: 2, mt: 2 }}>
              <Grid container spacing={2} justifyContent="center">
                <Grid item>
                  <MuiLink component={Link} to="/privacy" color="text.secondary">
                    Privacy Policy
                  </MuiLink>
                </Grid>
                <Grid item>
                  <MuiLink component={Link} to="/terms" color="text.secondary">
                    Terms of Service
                  </MuiLink>
                </Grid>
              </Grid>
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default Footer; 
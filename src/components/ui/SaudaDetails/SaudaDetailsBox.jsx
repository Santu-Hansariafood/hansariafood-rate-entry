import React, { useState } from "react";
import {
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Box,
  CircularProgress,
  Grid,
} from "@mui/material";
import axiosInstance from "@/lib/axiosInstance/axiosInstance";

const SaudaDetailsBox = () => {
  const [saudaNumber, setSaudaNumber] = useState('');
  const [saudaDetails, setSaudaDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchSaudaDetails = async () => {
    if (!saudaNumber.trim()) {
      setError('Please enter a sauda number');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const response = await axiosInstance.get(
        `/sauda/getSaudaByNumber?saudaNumber=${saudaNumber.trim()}`
      );
      if (response.data.success) {
        setSaudaDetails(response.data.data);
      } else {
        setError('Failed to fetch sauda details');
      }
    } catch (error) {
      console.error('Error fetching sauda details:', error);
      setError(error.response?.data?.error || 'Failed to fetch sauda details');
      setSaudaDetails(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card sx={{ maxWidth: 600, mx: 'auto', mt: 4, boxShadow: 3 }}>
      <CardContent>
        <Typography variant="h5" component="div" gutterBottom>
          Sauda Details Lookup
        </Typography>
        
        <Box sx={{ display: 'flex', mb: 3 }}>
          <TextField
            fullWidth
            label="Enter Sauda Number"
            variant="outlined"
            value={saudaNumber}
            onChange={(e) => setSaudaNumber(e.target.value)}
            sx={{ mr: 2 }}
          />
          <Button 
            variant="contained" 
            onClick={fetchSaudaDetails}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Fetch Details'}
          </Button>
        </Box>

        {error && (
          <Typography color="error" sx={{ mb: 2 }}>
            {error}
          </Typography>
        )}

        {saudaDetails && (
          <Box sx={{ mt: 2, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
            <Typography variant="h6" gutterBottom>
                  Sauda #{saudaDetails.saudaNo ? saudaDetails.saudaNo.toString().split("-").pop() : ""} - {saudaDetails.type}
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">
                  Date
                </Typography>
                <Typography variant="body1">
                  {saudaDetails.date}
                </Typography>
              </Grid>
              
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">
                  Time
                </Typography>
                <Typography variant="body1">
                  {saudaDetails.time || 'N/A'}
                </Typography>
              </Grid>
              
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">
                  Company
                </Typography>
                <Typography variant="body1">
                  {saudaDetails.company}
                </Typography>
              </Grid>
              
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">
                  {saudaDetails.type === 'Purchase' ? 'Seller' : 'Buyer'}
                </Typography>
                <Typography variant="body1">
                  {saudaDetails.type === 'Purchase' 
                    ? (saudaDetails.sellerName || saudaDetails.sellerCompany || saudaDetails.seller || 'N/A')
                    : (saudaDetails.buyer || 'N/A')}
                </Typography>
              </Grid>
              
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">
                  Commodity
                </Typography>
                <Typography variant="body1">
                  {saudaDetails.commodity}
                </Typography>
              </Grid>
              
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">
                  Quantity
                </Typography>
                <Typography variant="body1">
                  {saudaDetails.tons} {saudaDetails.unit}
                </Typography>
              </Grid>
              
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">
                  Rate
                </Typography>
                <Typography variant="body1">
                  ₹{saudaDetails.finalRate.toLocaleString()}
                </Typography>
              </Grid>
              
              {saudaDetails.others && (
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">
                    Additional Details
                  </Typography>
                  <Typography variant="body1">
                    {saudaDetails.others}
                  </Typography>
                </Grid>
              )}
            </Grid>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default SaudaDetailsBox;

import React, { useState, useEffect } from 'react';
import { Container, Typography, Box, Grid, Card, CardContent, Paper, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import { LineChart, BarChart, PieChart } from '@mui/x-charts';
import axios from 'axios';

interface AnalyticsData {
  overview: {
    totalPosts: number;
    totalLikes: number;
    totalComments: number;
    totalViews: number;
    totalShares: number;
    engagementRate: number;
  };
  topPosts: Array<{
    _id: string;
    content: string;
    engagement: {
      totalLikes: number;
      totalViews: number;
    };
    createdAt: string;
  }>;
  postsByDay: Array<{
    _id: {
      year: number;
      month: number;
      day: number;
    };
    count: number;
    likes: number;
    comments: number;
    views: number;
  }>;
  tagEngagement: Array<{
    _id: string;
    count: number;
    totalLikes: number;
    totalComments: number;
    totalViews: number;
  }>;
}

const Analytics: React.FC = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [period, setPeriod] = useState('30d');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, [period]);

  const fetchAnalytics = async () => {
    try {
      const response = await axios.get(`/api/analytics/dashboard?period=${period}`);
      setAnalytics(response.data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg">
        <Typography>Loading analytics...</Typography>
      </Container>
    );
  }

  if (!analytics) {
    return (
      <Container maxWidth="lg">
        <Typography>No analytics data available</Typography>
      </Container>
    );
  }

  const chartData = analytics.postsByDay.map(item => ({
    date: `${item._id.month}/${item._id.day}`,
    posts: item.count,
    likes: item.likes,
    comments: item.comments,
    views: item.views
  }));

  return (
    <Container maxWidth="lg">
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">
          Analytics Dashboard
        </Typography>
        
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Period</InputLabel>
          <Select
            value={period}
            label="Period"
            onChange={(e) => setPeriod(e.target.value)}
          >
            <MenuItem value="7d">Last 7 days</MenuItem>
            <MenuItem value="30d">Last 30 days</MenuItem>
            <MenuItem value="90d">Last 90 days</MenuItem>
            <MenuItem value="1y">Last year</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Overview Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={2}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Total Posts
              </Typography>
              <Typography variant="h4">
                {analytics.overview.totalPosts}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Total Likes
              </Typography>
              <Typography variant="h4">
                {analytics.overview.totalLikes}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Total Comments
              </Typography>
              <Typography variant="h4">
                {analytics.overview.totalComments}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Total Views
              </Typography>
              <Typography variant="h4">
                {analytics.overview.totalViews}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Total Shares
              </Typography>
              <Typography variant="h4">
                {analytics.overview.totalShares}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Engagement Rate
              </Typography>
              <Typography variant="h4">
                {analytics.overview.engagementRate}%
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Charts */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Post Activity Over Time
            </Typography>
            <LineChart
              width={800}
              height={300}
              series={[
                { data: chartData.map(d => d.posts), label: 'Posts', color: '#1976d2' },
                { data: chartData.map(d => d.likes), label: 'Likes', color: '#dc004e' },
                { data: chartData.map(d => d.comments), label: 'Comments', color: '#2e7d32' },
                { data: chartData.map(d => d.views), label: 'Views', color: '#ed6c02' }
              ]}
              xAxis={[{ data: chartData.map(d => d.date), scaleType: 'point' }]}
            />
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Top Performing Tags
            </Typography>
            {analytics.tagEngagement.length > 0 ? (
              <PieChart
                series={[
                  {
                    data: analytics.tagEngagement.slice(0, 5).map((tag, index) => ({
                      id: index,
                      value: tag.totalLikes,
                      label: tag._id
                    }))
                  }
                ]}
                width={400}
                height={300}
              />
            ) : (
              <Typography color="text.secondary">
                No tag data available
              </Typography>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Top Performing Posts
            </Typography>
            {analytics.topPosts.length > 0 ? (
              analytics.topPosts.map((post, index) => (
                <Box key={post._id} sx={{ mb: 2, p: 2, border: 1, borderColor: 'divider', borderRadius: 1 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    #{index + 1} - {post.content.substring(0, 100)}...
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      {post.engagement.totalLikes} likes
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {post.engagement.totalViews} views
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {new Date(post.createdAt).toLocaleDateString()}
                    </Typography>
                  </Box>
                </Box>
              ))
            ) : (
              <Typography color="text.secondary">
                No posts data available
              </Typography>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Analytics;

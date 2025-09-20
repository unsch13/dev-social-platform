import React, { useState } from 'react';
import { AppBar, Toolbar, Typography, Button, Box, IconButton, Badge, Menu, MenuItem, Avatar, Drawer, List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import { Menu as MenuIcon, Notifications, Message, Analytics, Home, Search, Person, Logout } from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useSocket } from '../../contexts/SocketContext';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { notifications, unreadCount, markNotificationAsRead } = useSocket();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [notificationAnchor, setNotificationAnchor] = useState<null | HTMLElement>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationClick = (event: React.MouseEvent<HTMLElement>) => {
    setNotificationAnchor(event.currentTarget);
  };

  const handleNotificationClose = () => {
    setNotificationAnchor(null);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    handleMenuClose();
  };

  const drawer = (
    <Box>
      <Toolbar />
      <List>
        <ListItem button onClick={() => { navigate('/'); setMobileOpen(false); }}>
          <ListItemIcon><Home /></ListItemIcon>
          <ListItemText primary="Home" />
        </ListItem>
        <ListItem button onClick={() => { navigate('/search'); setMobileOpen(false); }}>
          <ListItemIcon><Search /></ListItemIcon>
          <ListItemText primary="Search" />
        </ListItem>
        {user && (
          <>
            <ListItem button onClick={() => { navigate('/messages'); setMobileOpen(false); }}>
              <ListItemIcon><Message /></ListItemIcon>
              <ListItemText primary="Messages" />
            </ListItem>
            <ListItem button onClick={() => { navigate('/analytics'); setMobileOpen(false); }}>
              <ListItemIcon><Analytics /></ListItemIcon>
              <ListItemText primary="Analytics" />
            </ListItem>
          </>
        )}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          
          <Typography 
            variant="h6" 
            component="div" 
            sx={{ flexGrow: 1, cursor: 'pointer' }}
            onClick={() => navigate('/')}
          >
            DevSocial
          </Typography>

          {user ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <IconButton
                color="inherit"
                onClick={handleNotificationClick}
              >
                <Badge badgeContent={unreadCount} color="error">
                  <Notifications />
                </Badge>
              </IconButton>

              <IconButton
                color="inherit"
                onClick={() => navigate('/messages')}
              >
                <Message />
              </IconButton>

              <IconButton
                size="large"
                edge="end"
                aria-label="account of current user"
                aria-controls="primary-search-account-menu"
                aria-haspopup="true"
                onClick={handleProfileMenuOpen}
                color="inherit"
              >
                <Avatar 
                  src={user.avatar} 
                  alt={user.username}
                  sx={{ width: 32, height: 32 }}
                >
                  {user.firstName[0]}
                </Avatar>
              </IconButton>
            </Box>
          ) : (
            <Box>
              <Button color="inherit" onClick={() => navigate('/login')}>
                Login
              </Button>
              <Button color="inherit" onClick={() => navigate('/register')}>
                Register
              </Button>
            </Box>
          )}
        </Toolbar>
      </AppBar>

      {/* Mobile drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true,
        }}
        sx={{
          display: { xs: 'block', sm: 'none' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 240 },
        }}
      >
        {drawer}
      </Drawer>

      {/* Desktop drawer */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', sm: 'block' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 240 },
        }}
        open
      >
        {drawer}
      </Drawer>

      {/* Profile Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => { navigate(`/user/${user?.username}`); handleMenuClose(); }}>
          <Person /> Profile
        </MenuItem>
        <MenuItem onClick={() => { navigate('/analytics'); handleMenuClose(); }}>
          <Analytics /> Analytics
        </MenuItem>
        <MenuItem onClick={handleLogout}>
          <Logout /> Logout
        </MenuItem>
      </Menu>

      {/* Notifications Menu */}
      <Menu
        anchorEl={notificationAnchor}
        open={Boolean(notificationAnchor)}
        onClose={handleNotificationClose}
      >
        {notifications.length === 0 ? (
          <MenuItem>No notifications</MenuItem>
        ) : (
          notifications.slice(0, 5).map((notification) => (
            <MenuItem 
              key={notification._id}
              onClick={() => {
                markNotificationAsRead(notification._id);
                if (notification.relatedPost) {
                  navigate(`/post/${notification.relatedPost}`);
                }
                handleNotificationClose();
              }}
              sx={{ 
                backgroundColor: notification.isRead ? 'transparent' : 'action.hover',
                maxWidth: 300
              }}
            >
              <Box>
                <Typography variant="body2" fontWeight={notification.isRead ? 'normal' : 'bold'}>
                  {notification.title}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {notification.message}
                </Typography>
              </Box>
            </MenuItem>
          ))
        )}
      </Menu>

      <Box
        component="main"
        sx={{ 
          flexGrow: 1, 
          p: 3, 
          width: { sm: `calc(100% - 240px)` },
          mt: '64px'
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default Layout;

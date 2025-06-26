import {
  Dialog,
  DialogTitle,
  DialogContent,
  Typography,
  Box,
  IconButton,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import { 
  Close as CloseIcon,
  ExpandMore as ExpandMoreIcon,
  GetApp as GetIcon,
  PostAdd as PostIcon,
  Edit as PutIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';

export interface SimpleApiDocsModalProps {
  /** Controls whether the modal is open */
  open: boolean;
  /** Function called when the modal should be closed */
  onClose: () => void;
  /** Name of the applet/service for display */
  appletName: string;
  /** OpenAPI/Swagger specification object */
  apiSpec: any;
}

const methodColors = {
  GET: 'success',
  POST: 'primary', 
  PUT: 'warning',
  PATCH: 'info',
  DELETE: 'error',
} as const;

const methodIcons = {
  GET: GetIcon,
  POST: PostIcon,
  PUT: PutIcon,
  PATCH: PutIcon,
  DELETE: DeleteIcon,
};

/**
 * A lightweight API documentation modal that displays OpenAPI specs
 * without external dependencies that require syntax highlighting.
 */
export function SimpleApiDocsModal({
  open,
  onClose,
  appletName,
  apiSpec,
}: SimpleApiDocsModalProps) {
  if (!apiSpec) {
    return (
      <Dialog open={open} onClose={onClose} maxWidth="sm">
        <DialogTitle>
          API Documentation
          <IconButton
            aria-label="close"
            onClick={onClose}
            sx={{
              position: "absolute",
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
            size="large"
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Typography color="error" paragraph>
            No API specification available for {appletName}
          </Typography>
        </DialogContent>
      </Dialog>
    );
  }

  const paths = apiSpec.paths || {};
  const info = apiSpec.info || {};
  const servers = apiSpec.servers || [];

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: { height: "85vh", overflow: "visible" },
      }}
    >
      <DialogTitle sx={{ pb: 1, pr: 5 }}>
        {info.title || `${appletName} API Documentation`}
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            position: "absolute",
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
          size="large"
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ overflow: "auto", height: "100%" }}>
        {/* API Info */}
        {info.description && (
          <Paper sx={{ p: 2, mb: 2 }}>
            <Typography variant="body1" gutterBottom>
              {info.description}
            </Typography>
            {info.version && (
              <Chip label={`v${info.version}`} size="small" variant="outlined" />
            )}
          </Paper>
        )}

        {/* Servers */}
        {servers.length > 0 && (
          <Paper sx={{ p: 2, mb: 2 }}>
            <Typography variant="h6" gutterBottom>
              Servers
            </Typography>
            {servers.map((server: any, index: number) => (
              <Box key={index} sx={{ mb: 1 }}>
                <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                  {server.url}
                </Typography>
                {server.description && (
                  <Typography variant="caption" color="text.secondary">
                    {server.description}
                  </Typography>
                )}
              </Box>
            ))}
          </Paper>
        )}

        {/* Endpoints */}
        <Typography variant="h6" gutterBottom>
          Endpoints
        </Typography>
        
        {Object.entries(paths).map(([path, pathData]: [string, any]) => (
          <Box key={path} sx={{ mb: 2 }}>
            {Object.entries(pathData).map(([method, operation]: [string, any]) => {
              const methodUpper = method.toUpperCase() as keyof typeof methodColors;
              const Icon = methodIcons[methodUpper] || GetIcon;
              
              return (
                <Accordion key={`${path}-${method}`}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                      <Chip
                        icon={<Icon />}
                        label={methodUpper}
                        color={methodColors[methodUpper] || 'default'}
                        size="small"
                        sx={{ minWidth: 80 }}
                      />
                      <Typography 
                        variant="body1" 
                        sx={{ fontFamily: 'monospace', flexGrow: 1 }}
                      >
                        {path}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {operation.summary || operation.operationId}
                      </Typography>
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails>
                    {operation.description && (
                      <Typography paragraph>
                        {operation.description}
                      </Typography>
                    )}
                    
                    {/* Parameters */}
                    {operation.parameters && operation.parameters.length > 0 && (
                      <>
                        <Typography variant="h6" gutterBottom>
                          Parameters
                        </Typography>
                        <TableContainer component={Paper} sx={{ mb: 2 }}>
                          <Table size="small">
                            <TableHead>
                              <TableRow>
                                <TableCell>Name</TableCell>
                                <TableCell>Type</TableCell>
                                <TableCell>In</TableCell>
                                <TableCell>Required</TableCell>
                                <TableCell>Description</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {operation.parameters.map((param: any, index: number) => (
                                <TableRow key={index}>
                                  <TableCell sx={{ fontFamily: 'monospace' }}>
                                    {param.name}
                                  </TableCell>
                                  <TableCell>
                                    {param.schema?.type || param.type || 'string'}
                                  </TableCell>
                                  <TableCell>{param.in}</TableCell>
                                  <TableCell>
                                    {param.required ? 'Yes' : 'No'}
                                  </TableCell>
                                  <TableCell>{param.description || '-'}</TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      </>
                    )}

                    {/* Responses */}
                    {operation.responses && (
                      <>
                        <Typography variant="h6" gutterBottom>
                          Responses
                        </Typography>
                        {Object.entries(operation.responses).map(([code, response]: [string, any]) => (
                          <Paper key={code} sx={{ p: 2, mb: 1 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                              <Chip
                                label={code}
                                color={code.startsWith('2') ? 'success' : 'error'}
                                size="small"
                              />
                              <Typography variant="body2">
                                {response.description}
                              </Typography>
                            </Box>
                            {response.content && (
                              <Typography variant="caption" color="text.secondary">
                                Content-Type: {Object.keys(response.content).join(', ')}
                              </Typography>
                            )}
                          </Paper>
                        ))}
                      </>
                    )}
                  </AccordionDetails>
                </Accordion>
              );
            })}
          </Box>
        ))}
      </DialogContent>
    </Dialog>
  );
}
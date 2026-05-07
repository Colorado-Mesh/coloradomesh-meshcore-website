export type {
  MapAdvancedFeature,
  MapAdvancedFeatureStatus,
  MapBattery,
  MapConnectionState,
  MapConnectionStatus,
  MapCoordinates,
  MapLink,
  MapNode,
  MapNodeRole,
  MapNodeStatus,
  MapRadioMetrics,
  MapRoute,
  MapRuntimePublicConfig,
  MapSnapshot,
  MapSnapshotSource,
  MapSnapshotSourceType,
  MapSnapshotWarning,
  MapSnapshotWarningSeverity,
  MapStats,
} from './map';

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
}

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Child, Challenge, ProgressSummary, FeatureFlags } from '../../../types';
import { useChildContext } from '../contexts/ChildContext';
import { useFeatureFlags } from '../hooks/useFeatureFlags';
import { ProgressSummaryCard } from '../components/ProgressSummaryCard';

export default function DashboardPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Welcome to your Dashboard</h1>
    </div>
  )
} 
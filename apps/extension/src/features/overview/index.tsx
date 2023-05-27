import { rootRoute } from '@/Router'
import { Route } from '@tanstack/router'
import { OverviewView } from './views/overview'

export const overviewRoute = new Route({
  getParentRoute: () => rootRoute,
  path: '/',
  component: OverviewView
})

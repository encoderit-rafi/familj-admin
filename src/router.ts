import { createBrowserRouter } from "react-router-dom";
import type { RouteObject } from "react-router";
import LazyLoad from "./components/lazy/LazyComponent.tsx";
import { protectedElement } from "./utils/protectedElement.tsx";

// Layouts and routes ...
const DashboardLayout = LazyLoad(
  () => import("./layouts/DashboardLayout.tsx"),
  true,
);

const AuthLayout = LazyLoad(() => import("./layouts/AuthLayout.tsx"), true);

const routes: RouteObject[] = [
  {
    path: "/",
    element: DashboardLayout,
    children: [
      {
        index: true,
        element: protectedElement(
          "dashboard_access",
          LazyLoad(() => import("./pages/app/dashboard")),
        ),
        handle: { breadcrumb: "Dashboard" },
      },
      {
        path: "users",
        // element: LazyLoad(() => import('./pages/app/users')),
        element: protectedElement(
          "users_read",
          LazyLoad(() => import("./pages/app/users")),
        ),
        handle: { breadcrumb: "Users" },
        children: [
          {
            path: "create",
            element: protectedElement(
              "users_create",
              LazyLoad(() => import("./pages/app/users/create")),
            ),
            handle: { breadcrumb: "Create" },
          },
        ],
      },
      {
        path: "profile",
        handle: { breadcrumb: "Profile", path: "/profile" },
        children: [
          {
            path: "",
            element: LazyLoad(() => import("./pages/app/profile")),
          },
          {
            path: "change-password",
            element: LazyLoad(
              () => import("./pages/app/profile/change-password.tsx"),
            ),
            handle: { breadcrumb: "Change Password" },
          },
        ],
      },
      {
        path: "categories",
        element: protectedElement(
          "categories_read",
          LazyLoad(() => import("./pages/app/categories")),
        ),
        handle: { breadcrumb: "Categories" },
      },
      {
        path: "tags",
        element: protectedElement(
          "tags_read",
          LazyLoad(() => import("./pages/app/tags")),
        ),
        handle: { breadcrumb: "Tags" },
      },
      {
        path: "articles",
        handle: {
          breadcrumb: "Articles",
          path: "/articles",
        },
        children: [
          {
            path: "",
            element: protectedElement(
              "articles_read",
              LazyLoad(() => import("./pages/app/articles")),
            ),
          },
          {
            path: "create",
            element: protectedElement(
              "articles_create",
              LazyLoad(() => import("./pages/app/articles/create.tsx")),
            ),
            handle: { breadcrumb: "Create" },
          },
          {
            path: ":slug",
            handle: {
              breadcrumb: (params: { slug: string }) => `${params.slug}`,
              path: (params: { slug: string }) => `/articles/${params.slug}`,
            },
            children: [
              {
                path: "",
                element: protectedElement(
                  "articles_read",
                  LazyLoad(() => import("./pages/app/articles/[slug]")),
                ),
              },
              {
                path: "edit",
                element: protectedElement(
                  "articles_update",
                  LazyLoad(
                    () => import("./pages/app/articles/[slug]/edit.tsx"),
                  ),
                ),
                handle: {
                  breadcrumb: "Edit",
                },
              },
            ],
          },
        ],
      },
      {
        path: "tinder",
        handle: {
          breadcrumb: "Tinder",
          // path: "/",
        },
        children: [
          {
            path: "name",
            element: protectedElement(
              "articles_read",
              LazyLoad(() => import("./pages/app/tinder/name")),
            ),
          },
          {
            path: "categories",
            element: protectedElement(
              "articles_create",
              LazyLoad(() => import("./pages/app/tinder/categories")),
            ),
            handle: { breadcrumb: "Categories" },
          },
        ],
      },
      {
        path: "weekly-details",
        element: protectedElement(
          "weeklydetails_read",
          LazyLoad(() => import("./pages/app/weekly-details")),
        ),
        handle: { breadcrumb: "Weekly details" },
      },
      {
        path: "testimonials",
        element: protectedElement(
          "testimonials_read",
          LazyLoad(() => import("./pages/app/testimonials")),
        ),
        handle: { breadcrumb: "Testimonials" },
      },
      {
        path: "checklist-templates",
        element: protectedElement(
          "checklist-templates_read",
          LazyLoad(() => import("./pages/app/checklist-templates")),
        ),
        handle: { breadcrumb: "Checklist Templates" },
      },
      {
        path: "questions",
        element: protectedElement(
          "questions_read",
          LazyLoad(() => import("./pages/app/questions")),
        ),
        handle: { breadcrumb: "Questions" },
      },

      // question comments route
      {
        path: "question-comments",
        element: protectedElement(
          "questioncomment_read",
          LazyLoad(() => import("./pages/app/questionComments")),
        ),
        handle: { breadcrumb: "Question Comments" },
      },

      {
        path: "access-control",
        element: protectedElement(
          "roles_read",
          LazyLoad(() => import("./pages/app/access-control")),
        ),
        handle: { breadcrumb: "Access Control" },
      },
      {
        path: "flagged",
        element: protectedElement(
          "dashboard_access",
          LazyLoad(() => import("./pages/app/flagged")),
        ),
        handle: { breadcrumb: "Flagged Content" },
      },
      {
        path: "forbidden",
        element: LazyLoad(() => import("./pages/forbidden")),
      },
    ],
  },
  {
    path: "/auth",
    element: AuthLayout,
    children: [
      {
        path: "login",
        element: LazyLoad(() => import("./pages/auth/login")),
        // handle: {breadcrumb: 'Login'}
      },
      {
        path: "forgot-password",
        element: LazyLoad(() => import("./pages/auth/forget-password")),
        // handle: {breadcrumb: 'Forgot Password'}
      },
      {
        path: "reset-password",
        element: LazyLoad(() => import("./pages/auth/reset-password")),
      },
      {
        path: "register",
        element: LazyLoad(() => import("./pages/auth/register.tsx")),
      },
      {
        path: "verify-email",
        element: LazyLoad(() => import("./pages/auth/verify-email.tsx")),
      },
      {
        path: "verify-otp",
        element: LazyLoad(() => import("./pages/auth/verify-otp.tsx")),
      },
      {
        path: ":provider/success",
        element: LazyLoad(
          () => import("./pages/auth/provider/oauth-success.tsx"),
        ),
      },
      {
        path: ":provider/failure",
        element: LazyLoad(
          () => import("./pages/auth/provider/oauth-failure.tsx"),
        ),
      },
      // {
      //   path: "articles/app/:slug",
      //   element: LazyLoad(() => import("./pages/articles/app/[slug]")),
      // },
      // {
      //     path: 'create-store-success',
      //     element: LazyLoad(() => import('./pages/auth/create-store-success.tsx')),
      // },
    ],
  },
  // {
  //   path: 'forbidden',
  //   element: LazyLoad(() => import('./pages/forbidden')),
  // },
  {
    path: "articles/app/:slug",
    element: LazyLoad(() => import("./pages/articles/app/[slug]")),
  },
  {
    path: "*",
    element: LazyLoad(() => import("./pages/not-found")),
  },
];

export default createBrowserRouter(routes);

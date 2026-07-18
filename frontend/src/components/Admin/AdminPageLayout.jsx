/**
 * Shared shell for admin pages: background, padding, and the
 * title / subtitle / action-button header row every admin page uses.
 *
 *   ang gagamitin sa pages(sample):
 *   <AdminPageLayout
 *     title="Manage residents"
 *     subtitle="Review sign-ups, verify IDs, and manage account status"
 *     action={<button className="btn-primary !px-4 !py-2 !text-sm !font-medium w-full sm:w-auto">Add resident</button>}
 *   >
 *     ...page-specific content...
 *   </AdminPageLayout>
 */
export default function AdminPageLayout({ title, subtitle, action, children }) {
  return (
    <div className="min-h-screen bg-muted p-6 md:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl font-semibold text-foreground">{title}</h1>
          {subtitle && (
            <p className="text-sm text-muted-foreground mt-0.5">{subtitle}</p>
          )}
        </div>
        {action}
      </div>

      {children}
    </div>
  );
}
import { Link, useNavigate, useSearchParams } from 'react-router'
import { Calculator, Printer } from 'lucide-react'
import { ROLE_HOME } from '../auth/roles.js'
import Button from '../components/atoms/Button.jsx'
import Select from '../components/atoms/Select.jsx'
import Spinner from '../components/atoms/Spinner.jsx'
import Alert from '../components/molecules/Alert.jsx'
import LaporanDokumen from '../components/organisms/laporan/LaporanDokumen.jsx'
import PageTemplate from '../components/templates/PageTemplate.jsx'
import { withQuery } from '../lib/api.js'
import { useApiQuery } from '../lib/hooks.js'
import { periodeOptions, pilihPeriode } from '../lib/periode.js'

const PERHITUNGAN_PATH = `${ROLE_HOME.desa}/perhitungan`

// Laporan (desa): the official ranking report of a periode, built from its latest SAW run, printed
// with the browser's print dialog (Ctrl+P → Save as PDF / Microsoft Print to PDF). ?periode=<id> picks
// the periode (the Hasil Perangkingan page links here with it).
export default function LaporanPage() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()

  const periodeQuery = useApiQuery('/periode')
  const periodeList = periodeQuery.data?.data ?? []
  const periode = pilihPeriode(periodeList, searchParams.get('periode'))

  const runsQuery = useApiQuery(periode ? withQuery('/perhitungan', { periodeId: periode.id }) : null)
  // While a query reloads it still holds the previous periode's data; don't show that as this one's
  const runs = runsQuery.loading ? undefined : runsQuery.data?.data
  const runId = runs?.[0]?.id
  const detailQuery = useApiQuery(runId ? `/perhitungan/${runId}` : null)
  const run = detailQuery.loading ? undefined : detailQuery.data?.data

  const error = periodeQuery.error ?? runsQuery.error ?? detailQuery.error
  const noRuns = runs?.length === 0

  return (
    <PageTemplate
      title="Laporan"
      description="Laporan resmi hasil perangkingan SAW per periode, siap dicetak atau disimpan sebagai PDF."
      hideHeaderOnPrint
      actions={
        periode && (
          <>
            <Select
              size="sm"
              value={String(periode.id)}
              onChange={(e) => setSearchParams({ periode: e.target.value }, { replace: true })}
              aria-label="Pilih periode"
              options={periodeOptions(periodeList)}
            />
            <Button
              icon={Printer}
              disabled={!run}
              onClick={() => window.print()}
            >
              Cetak / Simpan PDF
            </Button>
          </>
        )
      }
    >
      <div className="space-y-3 print:hidden">
        {!periodeQuery.loading && !periodeList.length && <Alert tone="info">Belum ada periode bansos.</Alert>}
        {error && <Alert>{error.message}</Alert>}

        {run && (
          <Alert tone="info">
            Tekan <span className="font-semibold">Cetak / Simpan PDF</span> (atau Ctrl + P), lalu pilih tujuan{' '}
            <span className="font-semibold">Save as PDF</span> atau{' '}
            <span className="font-semibold">Microsoft Print to PDF</span> untuk menyimpan laporan sebagai berkas PDF.
          </Alert>
        )}
        {run && run.usang.length > 0 && (
          <Alert tone="warning">
            Hasil perhitungan terakhir sudah tidak sesuai data: {run.usang.join('; ')}.{' '}
            <Link
              to={PERHITUNGAN_PATH}
              className="font-semibold underline"
            >
              Jalankan perhitungan ulang
            </Link>{' '}
            sebelum mencetak laporan resmi.
          </Alert>
        )}

        {noRuns && (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-surface p-5">
            <p className="text-sm text-fg-muted">
              Belum ada perhitungan SAW untuk periode {periode.nama}, jadi laporan belum dapat dibuat.
            </p>
            <Button
              icon={Calculator}
              onClick={() => navigate(PERHITUNGAN_PATH)}
            >
              Ke Perhitungan SAW
            </Button>
          </div>
        )}
      </div>

      {runId && !run && !error && (
        <div
          className="flex justify-center py-16 text-fg-muted"
          role="status"
        >
          <Spinner className="size-6" />
          <span className="sr-only">Memuat laporan…</span>
        </div>
      )}

      {run && <LaporanDokumen perhitungan={run} />}
    </PageTemplate>
  )
}

import { useState, useRef, useEffect } from 'react';
import {
  X,
  Upload,
  Download,
  Loader2,
  CheckCircle2,
  Image as ImageIcon,
} from 'lucide-react';

import * as filestack from 'filestack-js';
import client from '../../api/client.js';

// ============================================================
// CONFIGURACIÓN
// ============================================================

const QR_URL =
    import.meta.env.VITE_PAYMENT_QR_URL || '';

const FILESTACK_API_KEY =
    import.meta.env.VITE_FILESTACK_API_KEY || '';

const ALLOWED_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
];

// ============================================================
// COMPONENTE PRINCIPAL
// ============================================================

export default function RegistrationModal({
                                            open,
                                            onClose,
                                          }) {
  // ==========================================================
  // FORMULARIO
  // ==========================================================

  const [form, setForm] = useState({
    fullName: '',
    accountName: '',
    phone: '',
  });

  // ==========================================================
  // COMPROBANTE
  // ==========================================================

  const [file, setFile] = useState(null);

  const [paymentProof, setPaymentProof] =
      useState('');

  const [paymentProofName, setPaymentProofName] =
      useState('');

  const [
    paymentProofExtension,
    setPaymentProofExtension,
  ] = useState('');

  const [
    paymentProofMimeType,
    setPaymentProofMimeType,
  ] = useState('');

  const [preview, setPreview] =
      useState(null);

  const [proofUploaded, setProofUploaded] =
      useState(false);

  // ==========================================================
  // ESTADOS
  // ==========================================================

  const [errors, setErrors] =
      useState({});

  const [submitting, setSubmitting] =
      useState(false);

  const [uploading, setUploading] =
      useState(false);

  const [success, setSuccess] =
      useState(null);

  const [serverError, setServerError] =
      useState('');

  // ==========================================================
  // FILESTACK
  // ==========================================================

  const pickerRef = useRef(null);

  // ==========================================================
  // INICIALIZAR FILESTACK
  // ==========================================================

  useEffect(() => {
    if (!FILESTACK_API_KEY) {
      console.error(
          '❌ VITE_FILESTACK_API_KEY no está configurada.'
      );

      return;
    }

    try {
      pickerRef.current =
          filestack.init(
              FILESTACK_API_KEY
          );

      console.log(
          '✅ Filestack inicializado correctamente'
      );

    } catch (error) {
      console.error(
          '❌ Error inicializando Filestack:',
          error
      );
    }

    return () => {
      pickerRef.current = null;
    };
  }, []);

  // ==========================================================
  // SI EL MODAL ESTÁ CERRADO
  // ==========================================================

  if (!open) {
    return null;
  }

  // ==========================================================
  // CAMBIAR INPUT
  // ==========================================================

  const handleChange =
      (field) => (e) => {
        setForm((current) => ({
          ...current,
          [field]: e.target.value,
        }));

        setErrors((current) => {
          const newErrors = {
            ...current,
          };

          delete newErrors[field];

          return newErrors;
        });
      };

  // ==========================================================
  // OBTENER EXTENSIÓN
  // ==========================================================

  const getExtension = (
      filename = ''
  ) => {
    if (!filename.includes('.')) {
      return '';
    }

    return `.${filename
        .split('.')
        .pop()
        .toLowerCase()}`;
  };

  // ==========================================================
  // ABRIR FILESTACK
  // ==========================================================

  const handleOpenUploader = () => {
    // --------------------------------------------------------
    // VERIFICAR API KEY
    // --------------------------------------------------------

    if (!FILESTACK_API_KEY) {
      setErrors((current) => ({
        ...current,
        file:
            'No está configurada la API Key de Filestack.',
      }));

      return;
    }

    // --------------------------------------------------------
    // VERIFICAR CLIENTE
    // --------------------------------------------------------

    if (!pickerRef.current) {
      setErrors((current) => ({
        ...current,
        file:
            'Filestack todavía no está listo. Recarga la página.',
      }));

      return;
    }

    // --------------------------------------------------------
    // LIMPIAR ERROR
    // --------------------------------------------------------

    setErrors((current) => {
      const newErrors = {
        ...current,
      };

      delete newErrors.file;

      return newErrors;
    });

    setServerError('');

    // --------------------------------------------------------
    // CONFIGURACIÓN FILESTACK
    // --------------------------------------------------------

    const options = {
      // ======================================================
      // IDIOMA ESPAÑOL
      // ======================================================

      lang: 'es',

      // ======================================================
      // ARCHIVOS
      // ======================================================

      maxFiles: 1,

      minFiles: 1,

      // ======================================================
      // FORMATOS PERMITIDOS
      // ======================================================

      accept: [
        'image/jpeg',
        'image/png',
      ],

      // ======================================================
      // FUENTES
      // ======================================================

      fromSources: [
        'local_file_system',
        'webcam',
      ],

      // ======================================================
      // NO SUBIR AUTOMÁTICAMENTE
      // ======================================================

      startUploadingWhenMaxFilesReached:
          false,

      // ======================================================
      // SUBIDA INICIADA
      // ======================================================

      onUploadStarted: () => {
        console.log(
            '📤 Filestack: subida iniciada'
        );

        setUploading(true);

        setErrors((current) => {
          const newErrors = {
            ...current,
          };

          delete newErrors.file;

          return newErrors;
        });
      },

      // ======================================================
      // ARCHIVO TERMINADO
      // ======================================================

      onFileUploadFinished: (
          uploadedFile
      ) => {
        console.log(
            '📁 Archivo terminado:',
            uploadedFile
        );
      },

      // ======================================================
      // ERROR DE ARCHIVO
      // ======================================================

      onFileUploadFailed: (
          uploadedFile,
          error
      ) => {
        console.error(
            '❌ Error subiendo archivo:',
            error
        );

        setUploading(false);

        setProofUploaded(false);

        setErrors((current) => ({
          ...current,
          file:
              'No se pudo subir el comprobante.',
        }));
      },

      // ======================================================
      // CANCELAR
      // ======================================================

      onCancel: () => {
        console.log(
            '⚠️ Filestack: selección cancelada'
        );

        setUploading(false);
      },

      // ======================================================
      // CERRAR PICKER
      // ======================================================

      onClose: () => {
        console.log(
            'ℹ️ Filestack: picker cerrado'
        );

        /*
         * IMPORTANTE:
         * NO ponemos proofUploaded en false aquí.
         *
         * El usuario puede cerrar el picker después
         * de haber subido correctamente el archivo.
         */

        setUploading(false);
      },

      // ======================================================
      // SUBIDA COMPLETADA
      // ======================================================

      onUploadDone: (result) => {
        console.log(
            '================================'
        );

        console.log(
            '✅ FILESTACK UPLOAD COMPLETADO'
        );

        console.log(result);

        console.log(
            '================================'
        );

        // ----------------------------------------------------
        // OBTENER ARCHIVO
        // ----------------------------------------------------

        const uploadedFile =
            result?.filesUploaded?.[0];

        // ----------------------------------------------------
        // VERIFICAR ARCHIVO
        // ----------------------------------------------------

        if (!uploadedFile) {
          setUploading(false);

          setProofUploaded(false);

          setErrors((current) => ({
            ...current,
            file:
                'No se recibió el comprobante.',
          }));

          return;
        }

        // ----------------------------------------------------
        // URL
        // ----------------------------------------------------

        const url =
            uploadedFile.url || '';

        // ----------------------------------------------------
        // NOMBRE
        // ----------------------------------------------------

        const filename =
            uploadedFile.filename ||
            uploadedFile.originalFile?.name ||
            'comprobante';

        // ----------------------------------------------------
        // MIME
        // ----------------------------------------------------

        const mimetype =
            uploadedFile.mimetype ||
            uploadedFile.originalFile?.type ||
            '';

        // ----------------------------------------------------
        // EXTENSIÓN
        // ----------------------------------------------------

        const extension =
            getExtension(filename);

        console.log(
            '🔗 URL:',
            url
        );

        console.log(
            '📄 Nombre:',
            filename
        );

        console.log(
            '📌 MIME:',
            mimetype
        );

        console.log(
            '📎 Extensión:',
            extension
        );

        // ----------------------------------------------------
        // VALIDAR URL
        // ----------------------------------------------------

        if (!url) {
          setUploading(false);

          setProofUploaded(false);

          setErrors((current) => ({
            ...current,
            file:
                'Filestack no devolvió una URL válida.',
          }));

          return;
        }

        // ----------------------------------------------------
        // VALIDAR TIPO
        // ----------------------------------------------------

        const normalizedMime =
            mimetype.toLowerCase();

        if (
            !ALLOWED_TYPES.includes(
                normalizedMime
            )
        ) {
          setUploading(false);

          setProofUploaded(false);

          setErrors((current) => ({
            ...current,
            file:
                'Solo se permiten archivos JPG, JPEG o PNG.',
          }));

          return;
        }

        // ----------------------------------------------------
        // GUARDAR ARCHIVO
        // ----------------------------------------------------

        setFile(uploadedFile);

        // URL FILESTACK
        setPaymentProof(url);

        // NOMBRE
        setPaymentProofName(
            filename
        );

        // EXTENSIÓN
        setPaymentProofExtension(
            extension.toUpperCase()
        );

        // MIME
        setPaymentProofMimeType(
            normalizedMime
        );

        // PREVISUALIZACIÓN
        setPreview(url);

        // ARCHIVO CARGADO
        setProofUploaded(true);

        // TERMINÓ LA SUBIDA
        setUploading(false);

        // ----------------------------------------------------
        // ELIMINAR ERROR
        // ----------------------------------------------------

        setErrors((current) => {
          const newErrors = {
            ...current,
          };

          delete newErrors.file;

          return newErrors;
        });

        console.log(
            '================================'
        );

        console.log(
            '✅ COMPROBANTE GUARDADO'
        );

        console.log(
            'URL:',
            url
        );

        console.log(
            'Nombre:',
            filename
        );

        console.log(
            'Extensión:',
            extension
        );

        console.log(
            'MIME:',
            normalizedMime
        );

        console.log(
            '================================'
        );
      },
    };

    // ========================================================
    // ABRIR PICKER
    // ========================================================

    try {
      console.log(
          '📂 Abriendo Filestack...'
      );

      pickerRef.current
          .picker(options)
          .open();

    } catch (error) {
      console.error(
          '❌ Error abriendo Filestack:',
          error
      );

      setUploading(false);

      setErrors((current) => ({
        ...current,
        file:
            'No se pudo abrir el selector de archivos.',
      }));
    }
  };

  // ==========================================================
  // VALIDAR FORMULARIO
  // ==========================================================

  const validate = () => {
    const next = {};

    // --------------------------------------------------------
    // NOMBRE
    // --------------------------------------------------------

    if (
        !form.fullName.trim() ||
        form.fullName.trim().length < 3
    ) {
      next.fullName =
          'Ingresa tu nombre completo';
    }

    // --------------------------------------------------------
    // TELÉFONO
    // --------------------------------------------------------

    if (
        !/^\d{7,15}$/.test(
            form.phone.trim()
        )
    ) {
      next.phone =
          'Número de celular inválido (solo dígitos)';
    }

    // --------------------------------------------------------
    // CUENTA
    // --------------------------------------------------------

    if (
        !form.accountName.trim() ||
        form.accountName.trim().length < 3
    ) {
      next.accountName =
          'Ingresa el nombre de la cuenta con la que depositaste';
    }

    // --------------------------------------------------------
    // COMPROBANTE
    // --------------------------------------------------------

    if (
        !proofUploaded ||
        !paymentProof
    ) {
      next.file =
          'Debes subir el comprobante de pago';
    }

    // --------------------------------------------------------
    // SI ESTÁ SUBIENDO
    // --------------------------------------------------------

    if (uploading) {
      next.file =
          'Espera a que termine de subir el comprobante';
    }

    // --------------------------------------------------------
    // GUARDAR ERRORES
    // --------------------------------------------------------

    setErrors(next);

    return (
        Object.keys(next).length === 0
    );
  };

  // ==========================================================
  // ENVIAR INSCRIPCIÓN
  // ==========================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setServerError('');

    // --------------------------------------------------------
    // VALIDAR
    // --------------------------------------------------------

    const isValid =
        validate();

    if (!isValid) {
      return;
    }

    // --------------------------------------------------------
    // PROTEGER CONTRA DOBLE ENVÍO
    // --------------------------------------------------------

    if (submitting) {
      return;
    }

    // --------------------------------------------------------
    // PROTEGER SI ESTÁ SUBIENDO
    // --------------------------------------------------------

    if (uploading) {
      return;
    }

    // --------------------------------------------------------
    // PROTEGER SIN COMPROBANTE
    // --------------------------------------------------------

    if (
        !proofUploaded ||
        !paymentProof
    ) {
      setErrors((current) => ({
        ...current,
        file:
            'Debes subir el comprobante de pago',
      }));

      return;
    }

    setSubmitting(true);

    try {
      // ======================================================
      // DATOS PARA BACKEND
      // ======================================================

      const payload = {
        fullName:
            form.fullName.trim(),

        accountName:
            form.accountName.trim(),

        phone:
            form.phone.trim(),

        // ====================================================
        // URL DE FILESTACK
        // ====================================================

        paymentProof:
        paymentProof,

        // ====================================================
        // INFORMACIÓN DEL ARCHIVO
        // ====================================================

        paymentProofName:
        paymentProofName,

        paymentProofExtension:
        paymentProofExtension,

        paymentProofMimeType:
        paymentProofMimeType,
      };

      console.log(
          '================================'
      );

      console.log(
          '📤 ENVIANDO INSCRIPCIÓN'
      );

      console.log(payload);

      console.log(
          '================================'
      );

      // ======================================================
      // POST
      // ======================================================

      const { data } =
          await client.post(
              '/participants/register',
              payload
          );

      console.log(
          '================================'
      );

      console.log(
          '✅ INSCRIPCIÓN REGISTRADA'
      );

      console.log(data);

      console.log(
          '================================'
      );

      // ======================================================
      // ÉXITO
      // ======================================================

      setSuccess(
          data.data
      );

    } catch (error) {
      console.error(
          '================================'
      );

      console.error(
          '❌ ERROR REGISTRANDO PARTICIPANTE'
      );

      console.error(error);

      console.error(
          '================================'
      );

      setServerError(
          error.response?.data?.message ||
          'No se pudo enviar tu inscripción. Intenta de nuevo.'
      );

    } finally {
      setSubmitting(false);
    }
  };

  // ==========================================================
  // CERRAR Y LIMPIAR
  // ==========================================================

  const handleClose = () => {
    setForm({
      fullName: '',
      accountName: '',
      phone: '',
    });

    setFile(null);

    setPaymentProof('');

    setPaymentProofName('');

    setPaymentProofExtension('');

    setPaymentProofMimeType('');

    setPreview(null);

    setProofUploaded(false);

    setErrors({});

    setSuccess(null);

    setServerError('');

    setUploading(false);

    setSubmitting(false);

    onClose();
  };

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">

        <div className="ticket-card w-full max-w-md max-h-[92vh] overflow-y-auto scrollbar-thin p-6 shadow-2xl">

          {/* ====================================================
            CABECERA
        ==================================================== */}

          <div className="flex items-start justify-between mb-5">

            <h2 className="font-display text-2xl tracking-wide text-gold-pale">
              REGISTRO DE PARTICIPANTE
            </h2>

            <button
                type="button"
                onClick={handleClose}
                className="text-cream-dim hover:text-cream transition-colors"
                aria-label="Cerrar"
            >
              <X size={22} />
            </button>

          </div>

          {/* ====================================================
            RESULTADO EXITOSO
        ==================================================== */}

          {success ? (

              <div className="text-center py-6">

                <CheckCircle2
                    className="mx-auto mb-3 text-gold"
                    size={48}
                />

                <p className="font-display text-xl text-gold-pale mb-1">
                  ¡Inscripción recibida!
                </p>

                <p className="text-sm text-cream-dim mb-4">

                  Tu ticket es el{' '}

                  <span className="font-mono text-gold">
                #{success.ticketNumber}
              </span>

                  . El administrador revisará tu comprobante pronto.

                </p>

                <button
                    type="button"
                    onClick={handleClose}
                    className="w-full rounded-lg bg-gradient-to-b from-gold-pale via-gold to-gold-deep py-3 font-body font-semibold uppercase tracking-wider text-[#2a1503]"
                >
                  Listo
                </button>

              </div>

          ) : (

              <form
                  onSubmit={handleSubmit}
                  className="space-y-5"
              >

                {/* =================================================
                QR DE PAGO
            ================================================= */}

                <div className="flex flex-col items-center">

                  <div className="h-40 w-40 rounded-xl border border-gold-deep/40 bg-black/30 flex items-center justify-center overflow-hidden">

                    {QR_URL ? (

                        <img
                            src={QR_URL}
                            alt="Código QR de pago"
                            className="h-full w-full object-cover"
                        />

                    ) : (

                        <span className="text-[11px] text-cream-dim text-center px-4">
                    Código QR de pago configurable
                    (VITE_PAYMENT_QR_URL)
                  </span>

                    )}

                  </div>

                  {QR_URL && (

                      <a
                          href={QR_URL}
                          download
                          className="mt-3 inline-flex items-center gap-1.5 text-xs text-gold underline decoration-gold-deep underline-offset-4"
                      >

                        <Download size={13} />

                        Descargar Código QR

                      </a>

                  )}

                </div>

                {/* =================================================
                NOMBRE COMPLETO
            ================================================= */}

                <Field
                    label="Nombre completo"
                    error={errors.fullName}
                >

                  <input
                      type="text"
                      placeholder="Ej. Juan Pérez"
                      value={form.fullName}
                      onChange={handleChange(
                          'fullName'
                      )}
                      className="input"
                      disabled={submitting}
                  />

                </Field>

                {/* =================================================
                TELÉFONO
            ================================================= */}

                <Field
                    label="Número de celular"
                    error={errors.phone}
                >

                  <input
                      type="tel"
                      inputMode="numeric"
                      placeholder="Ej. 70000000"
                      value={form.phone}
                      onChange={handleChange(
                          'phone'
                      )}
                      className="input"
                      disabled={submitting}
                  />

                </Field>

                {/* =================================================
                CUENTA
            ================================================= */}

                <Field
                    label="Nombre de la cuenta del depositante"
                    hint="Como aparece en el comprobante (puede ser distinto al tuyo)"
                    error={errors.accountName}
                >

                  <input
                      type="text"
                      placeholder="Ej. María Fernández"
                      value={form.accountName}
                      onChange={handleChange(
                          'accountName'
                      )}
                      className="input"
                      disabled={submitting}
                  />

                </Field>

                {/* =================================================
                COMPROBANTE
            ================================================= */}

                <Field
                    label="Comprobante de pago"
                    error={errors.file}
                >

                  {/* =================================================
                  BOTÓN FILESTACK
              ================================================= */}

                  <button
                      type="button"
                      onClick={
                        handleOpenUploader
                      }
                      disabled={
                          submitting ||
                          uploading
                      }
                      className="w-full rounded-lg border border-dashed border-gold-deep/50 bg-black/20 py-4 text-sm text-cream-dim hover:border-gold/60 hover:text-cream transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                  >

                    {uploading ? (

                        <>

                          <Loader2
                              size={18}
                              className="animate-spin"
                          />

                          Subiendo comprobante...

                        </>

                    ) : (

                        <>

                          <Upload size={18} />

                          {proofUploaded
                              ? 'Cambiar comprobante'
                              : 'Haz clic para subir captura'}

                        </>

                    )}

                  </button>

                  {/* =================================================
                  COMPROBANTE CARGADO
              ================================================= */}

                  {proofUploaded &&
                      paymentProof && (

                          <div className="mt-3 rounded-lg border border-gold-deep/30 bg-black/20 p-3">

                            {/* ==========================================
                      VISTA PREVIA
                  ========================================== */}

                            {preview && (

                                <div className="flex justify-center mb-3">

                                  <img
                                      src={preview}
                                      alt="Vista previa del comprobante"
                                      className="max-h-48 max-w-full rounded-lg object-contain"
                                  />

                                </div>

                            )}

                            {/* ==========================================
                      INFORMACIÓN
                  ========================================== */}

                            <div className="flex items-center gap-2">

                              <ImageIcon
                                  size={18}
                                  className="text-gold flex-shrink-0"
                              />

                              <div className="min-w-0 flex-1">

                                <p className="text-xs text-cream truncate">
                                  {paymentProofName}
                                </p>

                                <p className="text-[10px] text-cream-dim mt-1">

                                  {paymentProofExtension}

                                  {' • '}

                                  {paymentProofMimeType}

                                </p>

                              </div>

                              {/* ========================================
                        OK
                    ======================================== */}

                              <CheckCircle2
                                  size={20}
                                  className="text-green-400 flex-shrink-0"
                              />

                            </div>

                          </div>
                      )}

                </Field>

                {/* =================================================
                ERROR DEL SERVIDOR
            ================================================= */}

                {serverError && (

                    <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">

                      {serverError}

                    </p>

                )}

                {/* =================================================
                BOTÓN ENVIAR
            ================================================= */}

                <button
                    type="submit"
                    disabled={
                        submitting ||
                        uploading ||
                        !proofUploaded
                    }
                    className="w-full rounded-lg bg-black/40 border border-gold/50 py-3.5 font-body font-semibold uppercase tracking-wider text-gold-pale shadow-[0_0_18px_rgba(240,196,74,0.15)] hover:shadow-[0_0_24px_rgba(240,196,74,0.3)] transition-shadow disabled:opacity-50 flex items-center justify-center gap-2"
                >

                  {submitting ? (

                      <>

                        <Loader2
                            size={18}
                            className="animate-spin"
                        />

                        Enviando…

                      </>

                  ) : uploading ? (

                      <>

                        <Loader2
                            size={18}
                            className="animate-spin"
                        />

                        Subiendo comprobante…

                      </>

                  ) : (

                      <>
                        ⚡ ENVIAR INSCRIPCIÓN ⚡
                      </>

                  )}

                </button>

              </form>

          )}

        </div>

      </div>
  );
}

// ============================================================
// COMPONENTE FIELD
// ============================================================

function Field({
                 label,
                 hint,
                 error,
                 children,
               }) {
  return (
      <div>

        <label className="block text-[11px] font-body font-semibold uppercase tracking-wider text-cream-dim mb-1.5">

          {label}

        </label>

        {children}

        {hint && !error && (

            <p className="mt-1 text-[11px] text-cream-dim/70">

              {hint}

            </p>

        )}

        {error && (

            <p className="mt-1 text-[11px] text-red-300">

              {error}

            </p>

        )}

      </div>
  );
}
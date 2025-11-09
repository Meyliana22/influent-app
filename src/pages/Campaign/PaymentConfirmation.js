import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { COLORS } from "../../constants/colors";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import PaymentIcon from "@mui/icons-material/Payment";
import InfoIcon from "@mui/icons-material/Info";
import campaignService from "../../services/campaignService";
import { toast } from 'react-toastify';

function PaymentConfirmation() {
  const navigate = useNavigate();
  const { id } = useParams(); // Campaign ID from URL
  const [campaign, setCampaign] = useState(null);

  // Load campaign data from API
  useEffect(() => {
    const fetchCampaign = async () => {
      try {
        const response = await campaignService.getCampaignById(id);
        // Handle different response structures
        let data = response?.data?.data || response?.data || response;
        if (!data || !data.campaign_id) {
          console.error("❌ Campaign not found or invalid data:", data);
          toast.error("Campaign tidak ditemukan");
          navigate("/campaigns");
          return;
        }

        setCampaign(data);
      } catch (err) {
        console.error("❌ Error loading campaign:", err);
        toast.error("Gagal memuat data campaign");
        navigate("/campaigns");
      }
    };

    if (id) {
      fetchCampaign();
    } else {
      console.error("❌ No campaign ID provided");
      navigate("/campaigns");
    }
  }, [id, navigate]);

  // Calculate campaign costs
  const calculateCosts = () => {
    if (!campaign)
      return { total: 0, pricePerInfluencer: 0, influencerCount: 0 };

    const pricePerInfluencer = parseFloat(campaign.price_per_post) || 0;
    const influencerCount = parseInt(campaign.influencer_count) || 1;
    // Total = Jumlah Influencer × Price per Influencer
    const total = pricePerInfluencer * influencerCount;

    return {
      total,
      pricePerInfluencer,
      influencerCount,
    };
  };

  // Format date to Indonesian format
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    const options = { day: "numeric", month: "long", year: "numeric" };
    return date.toLocaleDateString("id-ID", options);
  };

  const costs = calculateCosts();

  // Handle payment process
  const handlePayment = async () => {
    try {
      const data = await campaignService.payment({
        campaign_id: campaign.campaign_id,
        user_id: campaign.student_id,
      });

      const redirectUrl = data?.snap.redirect_url;
      window.open(redirectUrl, "_blank");

      toast.success(
        "✅ Pembayaran berhasil! Campaign Anda sekarang aktif dan dapat menerima pendaftaran dari influencer."
      );

      navigate("/campaigns");
    } catch (err) {
      console.error("❌ Payment error:", err);
      toast.error("Gagal memproses pembayaran. Silakan coba lagi.");
    }
  };

  // Format currency
  const formatCurrency = (value) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  if (!campaign) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          background: COLORS.background,
          fontFamily: "Montserrat, Arial, sans-serif",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "3rem", marginBottom: "16px" }}>⏳</div>
          <p style={{ color: COLORS.textSecondary }}>
            Loading campaign data...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        background: COLORS.background,
        minHeight: "100vh",
        paddingBottom: "48px",
        fontFamily: "Montserrat, Arial, sans-serif",
      }}
    >
      <div
        style={{
          maxWidth: "700px",
          margin: "0 auto",
          paddingTop: "48px",
          padding: "48px 24px",
        }}
      >
        {/* Header */}
        <div
          style={{
            background: COLORS.white,
            borderRadius: "20px",
            boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
            padding: "32px",
            marginBottom: "24px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              marginBottom: "24px",
            }}
          >
            <button
              type="button"
              onClick={() => navigate(`/campaign-edit/${id}`)}
              aria-label="Kembali"
              style={{
                background: "rgba(102,126,234,0.12)",
                border: "none",
                borderRadius: "18px",
                width: "36px",
                height: "36px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 4px 24px rgba(102,126,234,0.08)",
                cursor: "pointer",
              }}
            >
              <ArrowBackIcon
                sx={{ fontSize: 16, color: COLORS.textPrimary }}
              />
            </button>
            <h2
              style={{
                fontWeight: 600,
                margin: 0,
                fontSize: "1.5rem",
                color: COLORS.textPrimary,
              }}
            >
              Konfirmasi Campaign
            </h2>
          </div>

          {/* Campaign Info */}
          <div
            style={{
              padding: "20px",
              background: COLORS.backgroundLight,
              borderRadius: "12px",
              marginBottom: "24px",
            }}
          >
            <h3
              style={{
                margin: "0 0 16px 0",
                fontSize: "1.2rem",
                fontWeight: 700,
                color: COLORS.textPrimary,
                borderBottom: "2px solid #667eea",
                paddingBottom: "12px",
              }}
            >
              Draft Campaign
            </h3>

            <div
              style={{ display: "flex", flexDirection: "column", gap: "12px" }}
            >
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span
                  style={{ color: COLORS.textSecondary, fontSize: "0.9rem" }}
                >
                  Jenis Campaign:
                </span>
                <span
                  style={{
                    fontWeight: 600,
                    color: COLORS.textPrimary,
                    fontSize: "0.95rem",
                  }}
                >
                  {campaign.campaign_category || "-"}
                </span>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span
                  style={{ color: COLORS.textSecondary, fontSize: "0.9rem" }}
                >
                  Deadline Proposal:
                </span>
                <span
                  style={{
                    fontWeight: 600,
                    color: COLORS.textPrimary,
                    fontSize: "0.95rem",
                  }}
                >
                  {formatDate(campaign.submission_deadline)}
                </span>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span
                  style={{ color: COLORS.textSecondary, fontSize: "0.9rem" }}
                >
                  Periode Campaign:
                </span>
                <span
                  style={{
                    fontWeight: 600,
                    color: COLORS.textPrimary,
                    fontSize: "0.95rem",
                    textAlign: "right",
                  }}
                >
                  {formatDate(campaign.start_date)} -{" "}
                  {formatDate(campaign.end_date)}
                </span>
              </div>
            </div>
          </div>

          {/* Cost Breakdown */}
          <div style={{ marginBottom: "32px" }}>
            <h3
              style={{
                fontWeight: 700,
                marginBottom: "16px",
                fontSize: "1.2rem",
                color: COLORS.textPrimary,
                borderBottom: "2px solid #667eea",
                paddingBottom: "12px",
              }}
            >
              Biaya Campaign
            </h3>

            {/* Breakdown Details */}
            <div
              style={{
                padding: "20px",
                background: COLORS.backgroundLight,
                borderRadius: "12px",
                marginBottom: "16px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <span
                    style={{
                      color: COLORS.textSecondary,
                      fontSize: "0.9rem",
                    }}
                  >
                    Jumlah Influencer
                  </span>
                  <span
                    style={{
                      fontWeight: 600,
                      color: COLORS.textPrimary,
                      fontSize: "1rem",
                    }}
                  >
                    {costs.influencerCount} influencer
                  </span>
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    paddingTop: "12px",
                    borderTop: "1px dashed #ddd",
                  }}
                >
                  <span
                    style={{
                      color: COLORS.textSecondary,
                      fontSize: "0.9rem",
                    }}
                  >
                    Biaya per Influencer
                  </span>
                  <span
                    style={{
                      fontWeight: 600,
                      color: COLORS.textPrimary,
                      fontSize: "1rem",
                    }}
                  >
                    {formatCurrency(costs.pricePerInfluencer)}
                  </span>
                </div>
              </div>
            </div>

            {/* Total */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "20px",
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                borderRadius: "12px",
                boxShadow: "0 4px 16px rgba(102, 126, 234, 0.3)",
              }}
            >
              <span
                style={{
                  fontSize: "1.2rem",
                  fontWeight: 700,
                  color: COLORS.white,
                }}
              >
                Total Bayar
              </span>
              <span
                style={{
                  fontSize: "1.3rem",
                  fontWeight: 700,
                  color: COLORS.white,
                }}
              >
                {formatCurrency(costs.total)}
              </span>
            </div>
          </div>

          {/* Info Note */}
          <div
            style={{
              padding: "16px",
              background: "#fff3cd",
              borderRadius: "12px",
              border: "1px solid #ffc107",
              marginBottom: "24px",
              display: "flex",
              alignItems: "center",
            }}
          >
            <p
              style={{
                margin: 0,
                fontSize: "0.85rem",
                color: "#856404",
                lineHeight: "1.5",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <InfoIcon
                style={{
                  fontSize: "1rem",
                  verticalAlign: "middle",
                  marginRight: "4px",
                }}
              />
              Biaya campaign yang tidak terpakai akan dikembalikan ke saldo
              Anda.
            </p>
          </div>

          {/* Payment Button */}
          <button
            onClick={handlePayment}
            style={{
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              borderRadius: "12px",
              fontWeight: 700,
              padding: "16px",
              fontSize: "1.1rem",
              boxShadow: "0 4px 16px rgba(102, 126, 234, 0.3)",
              border: "none",
              color: "#fff",
              cursor: "pointer",
              width: "100%",
              transition: "all 0.3s ease",
              alignItems: "center",
              display: "flex",
              justifyContent: "center",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow =
                "0 8px 24px rgba(102, 126, 234, 0.5)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow =
                "0 4px 16px rgba(102, 126, 234, 0.3)";
            }}
          >
            <PaymentIcon sx={{ fontSize: 24, color: COLORS.white, marginRight: '8px' }} />
            Proses Pembayaran
          </button>
        </div>
      </div>
    </div>
  );
}

export default PaymentConfirmation;

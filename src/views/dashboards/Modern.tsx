import { TopCards } from "src/components/dashboards/modern/TopCards";
import { RevenueUpdate } from "src/components/dashboards/modern/RevenueUpdate";
import { YearlyBreakup } from "src/components/dashboards/modern/YearlyBreakup";
import { MonthlyEarning } from "src/components/dashboards/modern/MonthlyEarning";
import { UncollectedTargets } from "src/components/dashboards/modern/RecentTransaction";
import { RepresentativePerformance } from "src/components/dashboards/modern/ProuctPerformance";
import { Footer } from "src/components/dashboards/modern/Footer";
import ProfileWelcome from "src/components/dashboards/modern/ProfileWelcome";

const Moderndash = () => {
    return (
        <div className="grid grid-cols-12 gap-6">

            {/* =====================================================
                WELCOME
            ====================================================== */}
            <div className="col-span-12">
                <ProfileWelcome />
            </div>

            {/* =====================================================
                KPI CARDS
            ====================================================== */}
            <div className="col-span-12">
                <TopCards />
            </div>

            {/* =====================================================
                REVENUE + FINANCIAL SUMMARY
            ====================================================== */}
            {/* <div className="lg:col-span-8 col-span-12 h-full">
                <RevenueUpdate />
            </div>

            <div className="lg:col-span-4 col-span-12 grid grid-rows-2 gap-6">
                <YearlyBreakup />
                <MonthlyEarning />
            </div> */}

            {/* =====================================================
                COLLECTION OPERATIONS
            ====================================================== */}
            <div className="lg:col-span-7 col-span-12 h-full">
                <UncollectedTargets />
            </div>

            <div className="lg:col-span-5 col-span-12 h-full">
                <RepresentativePerformance />
            </div>

            {/* =====================================================
                FOOTER
            ====================================================== */}
            <div className="col-span-12">
                <Footer />
            </div>

        </div>
    );
};

export default Moderndash;
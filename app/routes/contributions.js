const ContributionsDAO = require("../data/contributions-dao").ContributionsDAO;
const {
    environmentalScripts
} = require("../../config/config");

/* The ContributionsHandler must be constructed with a connected db */
function ContributionsHandler(db) {
    "use strict";

    const contributionsDAO = new ContributionsDAO(db);

    this.displayContributions = (req, res, next) => {
        const {
            userId
        } = req.session;

        contributionsDAO.getByUserId(userId, (error, contrib) => {
            if (error) return next(error);

            contrib.userId = userId; // set for nav menu items
            return res.render("contributions", {
                ...contrib,
                environmentalScripts
            });
        });
    };

    this.handleContributionsUpdate = (req, res, next) => {

        // SECURITY FIX: Replace eval() with safe numeric conversion
        const preTaxInput = req.body.preTax;
        const afterTaxInput = req.body.afterTax;
        const rothInput = req.body.roth;

        const preTax = Number(preTaxInput);
        const afterTax = Number(afterTaxInput);
        const roth = Number(rothInput);

        const {
            userId
        } = req.session;

        // Validate required inputs and reject invalid percentages
        const inputs = [preTaxInput, afterTaxInput, rothInput];
        const values = [preTax, afterTax, roth];

        const isInvalid = inputs.some((input, index) =>
            typeof input !== "string" ||
            input.trim() === "" ||
            !Number.isFinite(values[index]) ||
            values[index] < 0
        );

        if (isInvalid) {
            return res.render("contributions", {
                updateError: "Invalid contribution percentages",
                userId,
                environmentalScripts
            });
        }

        // Prevent more than 30% total contributions
        if (preTax + afterTax + roth > 30) {
            return res.render("contributions", {
                updateError: "Contribution percentages cannot exceed 30 %",
                userId,
                environmentalScripts
            });
        }

        contributionsDAO.update(
            userId,
            preTax,
            afterTax,
            roth,
            (err, contributions) => {
                if (err) return next(err);

                contributions.updateSuccess = true;
                return res.render("contributions", {
                    ...contributions,
                    environmentalScripts
                });
            }
        );
    };
}

module.exports = ContributionsHandler;
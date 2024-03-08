import proposal, {ProposalType} from '#models/proposal.model';
import customError from '#utils/customError';

class Proposal {
  _proposal!: ProposalType;

  get proposal(): ProposalType{
    return this._proposal;
  }

  /**
     * Get the active proposal
     * @returns {Promise<void>}
     */
  public async init(): Promise<void>{
    this._proposal = await this._getActiveProposal();
  }

  /**
   * Get one proposal and send it in the response. Only one proposal can be found at a time.
   * @returns {Promise<ProposalType>}
   */
  private async _getActiveProposal(): Promise<ProposalType>{
    const activeProposal = await proposal.findOne({ active: true });
    if (!activeProposal) {
      throw customError('No active proposal found', 404);
    }
    return activeProposal;
  }
}

export default Proposal;
